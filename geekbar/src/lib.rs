pub use geekbar_core::executor::{Executor, Work, WorkReceiver};
use geekbar_store::Store;

pub struct Geekbar {
    store: Store,
    pub executor: Executor,
}

impl Geekbar {
    pub fn init() -> anyhow::Result<Self> {
        let mut executor = Executor::default();
        let mut store = Store::init()?;

        let workflows = store.fetch_all_workflows()?;
        executor.add_workflows(workflows);

        let geekbar = Geekbar { store, executor };

        Ok(geekbar)
    }

    pub fn receiver(&self) -> WorkReceiver {
        self.executor.receiver().clone()
    }
}
