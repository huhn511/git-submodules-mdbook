// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

#![allow(dead_code)]

use wasmlib::*;

pub const SC_NAME: &str = "dividend";
pub const HSC_NAME: ScHname = ScHname(0xcce2e239);

pub const PARAM_ADDRESS: &str = "address";
pub const PARAM_FACTOR: &str = "factor";
pub const PARAM_OWNER: &str = "owner";

pub const VAR_FACTOR: &str = "factor";
pub const VAR_MEMBER_LIST: &str = "memberList";
pub const VAR_MEMBERS: &str = "members";
pub const VAR_OWNER: &str = "owner";
pub const VAR_TOTAL_FACTOR: &str = "totalFactor";

pub const FUNC_DIVIDE: &str = "divide";
pub const FUNC_INIT: &str = "init";
pub const FUNC_MEMBER: &str = "member";
pub const FUNC_SET_OWNER: &str = "setOwner";
pub const VIEW_GET_FACTOR: &str = "getFactor";

pub const HFUNC_DIVIDE: ScHname = ScHname(0xc7878107);
pub const HFUNC_INIT: ScHname = ScHname(0x1f44d644);
pub const HFUNC_MEMBER: ScHname = ScHname(0xc07da2cb);
pub const HFUNC_SET_OWNER: ScHname = ScHname(0x2a15fe7b);
pub const HVIEW_GET_FACTOR: ScHname = ScHname(0x0ee668fe);
