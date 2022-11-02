use std::{
    sync::{Arc, Mutex},
    thread,
};

use geekbar_core::{executor::Executor, prompt::work_handler};

fn main() -> anyhow::Result<()> {
    let works_executor = Arc::new(Mutex::new(Executor::default()));

    let receiver = works_executor.lock().unwrap().receiver().clone();
    let executor = works_executor.clone();
    let handle = thread::spawn(move || {
        while let Ok(work) = receiver.recv() {
            let work = work_handler(work).unwrap();
            executor.lock().unwrap().receive_work(work, None).unwrap();
        }
    });

    let args = std::env::args().collect::<Vec<String>>();
    let params = args.get(1);
    works_executor.lock().unwrap().execute_workflow_file(
        "examples/search/workflow.json",
        "search",
        params,
    )?;

    handle.join().unwrap();

    Ok(())
}
