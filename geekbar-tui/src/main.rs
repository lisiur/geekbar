use cursive::event::Key;
use serde_json::Value;
use std::thread;

use cursive::align::HAlign;
use cursive::views::{EditView, LinearLayout, SelectView};
use cursive::Cursive;
use cursive::{event::Event, traits::*, CursiveExt};
use geekbar_core::executor::{WorkParams, WorksExecutor};
use geekbar_core::prompt::Prompt;
use geekbar_core::workflow::Workflow;
use workflow::Workflows;

mod workflow;

struct State {
    works_executor: WorksExecutor,
    // none means no more work to do
    work_params: Option<WorkParams>,
    selected_index: usize,
    total: usize,
}

fn main() -> anyhow::Result<()> {
    cursive::logger::init();

    let mut siv = Cursive::default();
    let mut works_executor = WorksExecutor::default();
    siv.load_toml(include_str!("./dark.toml")).unwrap();

    works_executor.add_workflows(load_workflows()?);
    let works_receiver = works_executor.receiver().clone();

    let state = State {
        works_executor,
        work_params: None,
        selected_index: 0,
        total: 0,
    };

    siv.set_user_data(state);

    siv.add_global_callback(Event::Key(Key::Up), handle_list_keyup);
    siv.add_global_callback(Event::Key(Key::Down), handle_list_keydown);

    let edit_view = EditView::new();
    let edit_view = edit_view
        .on_edit_mut(keyword_change_handler)
        .on_submit_mut(input_submit_handler)
        .filler(' ')
        .with_name("input")
        .fixed_width(30)
        .fixed_height(1);
    let select_view = SelectView::<Option<Value>>::new()
        .h_align(HAlign::Left)
        .disabled()
        .with_name("list")
        .scrollable();

    siv.add_layer(LinearLayout::vertical().child(edit_view).child(select_view));

    let cb_sink = siv.cb_sink().clone();
    thread::spawn(move || {
        while let Ok(work_params) = works_receiver.recv() {
            cb_sink
                .send(Box::new(move |siv: &mut Cursive| {
                    render(siv, work_params);
                }))
                .unwrap();
        }
    });
    siv.run();
    Ok(())
}

fn render(siv: &mut Cursive, work_params: Option<WorkParams>) {
    let state = siv.user_data::<State>().unwrap();
    state.work_params = work_params;
    let prompt = state.work_params.as_mut().and_then(|o| o.take_prompt());
    if let Some(prompt) = prompt {
        match prompt {
            Prompt::Select { options, .. } | Prompt::FuzzySelect { options, .. } => {
                state.total = options.len();
                state.selected_index = 0;
                siv.call_on_name("list", |view: &mut SelectView<Option<Value>>| {
                    view.clear();

                    for opt in options {
                        view.add_item(opt.title, Some(opt.value));
                    }
                });
                update_list(siv);
            }
            Prompt::Input { .. } => {}
            _ => {}
        };
    } else {
        pass(siv)
    }
}

fn update_list(siv: &mut Cursive) {
    let state = siv.user_data::<State>().unwrap();
    let selected_index = state.selected_index;
    let total = state.total;
    siv.call_on_name("list", |view: &mut SelectView<Option<Value>>| {
        if total > 0 {
            view.set_selection(selected_index);
        }
    });
}

fn handle_list_keyup(siv: &mut Cursive) {
    let state = siv.user_data::<State>().unwrap();
    if state.total == 0 {
        return;
    }
    if state.selected_index > 0 {
        state.selected_index -= 1;
    } else {
        state.selected_index = state.total - 1;
    }
    update_list(siv);
}

fn handle_list_keydown(siv: &mut Cursive) {
    let state = siv.user_data::<State>().unwrap();
    if state.total == 0 {
        return;
    }
    if state.selected_index >= state.total - 1 {
        state.selected_index = 0;
    } else {
        state.selected_index += 1;
    }
    update_list(siv);
}

fn keyword_change_handler(siv: &mut Cursive, keyword: &str, _pos: usize) {
    let state = siv.user_data::<State>().unwrap();

    let keyword_chunk = keyword.splitn(2, ' ').collect::<Vec<_>>();
    let keyword = keyword_chunk.first().unwrap_or(&"");
    let params = keyword_chunk.get(1).unwrap_or(&"");
    if state.works_executor.has_trigger(keyword) {
        if let Err(err) = state
            .works_executor
            .trigger(keyword, Some(params.to_string()))
        {
            log::error!("{}", err);
        }
    } else {
        siv.call_on_name("list", |view: &mut SelectView<Option<Value>>| {
            view.clear();
        });
    }
}

fn reset_input(siv: &mut Cursive) {
    siv.call_on_name("input", |view: &mut EditView| {
        view.set_content("");
    });
}

fn reset_list(siv: &mut Cursive) {
    siv.call_on_name("list", |view: &mut SelectView<Option<Value>>| {
        view.clear();
    });
}

fn reset_all(siv: &mut Cursive) {
    reset_input(siv);
    reset_list(siv);
}

fn input_submit_handler(siv: &mut Cursive, _keyword: &str) {
    submit(siv);
}

fn submit(siv: &mut Cursive) {
    let state = siv.user_data::<State>().unwrap();
    let selected_index = state.selected_index;
    let value = siv.call_on_name("list", |view: &mut SelectView<Option<Value>>| {
        view.get_item_mut(selected_index)
            .and_then(|item| item.1.take())
    });

    let state = siv.user_data::<State>().unwrap();
    let work_params = state.work_params.take();

    state
        .works_executor
        .send_params(work_params.unwrap(), value.unwrap_or_default())
        .unwrap();

    reset_all(siv);
}

fn pass(siv: &mut Cursive) {
    let state = siv.user_data::<State>().unwrap();
    let work_params = state.work_params.take();

    if let Some(work_params) = work_params {
        state.works_executor.send_params(work_params, None).unwrap();
    }
}

fn load_workflows() -> anyhow::Result<Vec<Workflow>> {
    let workflow_factories = Workflows::load_workflows()?;
    let workflows = workflow_factories
        .into_iter()
        .map(|f| f.workflow)
        .collect::<Vec<_>>();
    Ok(workflows)
}
