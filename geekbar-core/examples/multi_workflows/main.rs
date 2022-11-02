use geekbar_core::executor::Executor;
use geekbar_core::prompt::work_handler;
use geekbar_core::workflow::WorkflowBuilder;
use std::{
    sync::{Arc, Mutex},
    thread,
};

fn main() -> anyhow::Result<()> {
    let works_executor = Arc::new(Mutex::new(Executor::default()));

    let receiver = works_executor.lock().unwrap().receiver().clone();
    let executor = works_executor.clone();
    let handle = thread::spawn(move || {
        while let Ok(work) = receiver.recv() {
            let work_params = work_handler(work).unwrap();
            executor
                .lock()
                .unwrap()
                .receive_work(work_params, None)
                .unwrap();
        }
    });

    let workflow_1 = WorkflowBuilder::default()
        .json(include_str!("workflow_1.json"))
        .build()?;
    let workflow_2 = WorkflowBuilder::default()
        .json(include_str!("workflow_2.json"))
        .build()?;

    works_executor.lock().unwrap().add_workflow(workflow_1);
    works_executor.lock().unwrap().add_workflow(workflow_2);

    let args = std::env::args().collect::<Vec<String>>();
    let keyword = args.get(1).expect("please input keyword");
    let params = args.get(2);

    works_executor
        .lock()
        .unwrap()
        .trigger(keyword, Some(params))?;

    handle.join().unwrap();
    Ok(())
}
