// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

pub mod config;
pub mod dust;
pub mod error;
pub mod event;
pub mod merkle_hasher;
pub mod metadata;
pub mod state;
pub mod storage;
pub mod white_flag;
pub mod worker;

pub use storage::StorageBackend;
pub use white_flag::white_flag;
pub use worker::{LedgerWorker, LedgerWorkerEvent};

use bee_runtime::node::{Node, NodeBuilder};

pub fn init<N>(node_builder: N::Builder) -> N::Builder
where
    N: Node,
    N::Backend: StorageBackend,
{
    node_builder.with_worker::<LedgerWorker>()
}
