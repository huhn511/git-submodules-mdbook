// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

use wasmlib::*;

use crate::*;
use crate::types::*;

pub fn func_mint_supply(ctx: &ScFuncContext) {
    ctx.log("tokenregistry.mintSupply");
    let p = ctx.params();
    let param_description = p.get_string(PARAM_DESCRIPTION);
    let param_user_defined = p.get_string(PARAM_USER_DEFINED);

    let minted_supply = ctx.minted_supply();
    if minted_supply == 0 {
        ctx.panic("TokenRegistry: No newly minted tokens found");
    }
    let minted_color = ctx.minted_color();
    let state = ctx.state();
    let registry = state.get_map(VAR_REGISTRY).get_bytes(&minted_color);
    if registry.exists() {
        // should never happen, because transaction id is unique
        ctx.panic("TokenRegistry: registry for color already exists");
    }
    let mut token = Token {
        supply: minted_supply,
        minted_by: ctx.caller(),
        owner: ctx.caller(),
        created: ctx.timestamp(),
        updated: ctx.timestamp(),
        description: param_description.value(),
        user_defined: param_user_defined.value(),
    };
    if token.description.is_empty() {
        token.description += "no dscr";
    }
    registry.set_value(&token.to_bytes());
    let colors = state.get_color_array(VAR_COLOR_LIST);
    colors.get_color(colors.length()).set_value(&minted_color);
    ctx.log("tokenregistry.mintSupply ok");
}

pub fn func_transfer_ownership(ctx: &ScFuncContext) {
    ctx.log("tokenregistry.transferOwnership");
    //TODO the one who can transfer token ownership
    ctx.require(ctx.caller() == ctx.contract_creator(), "no permission");

    let p = ctx.params();
    let param_color = p.get_color(PARAM_COLOR);
    ctx.require(param_color.exists(), "missing mandatory color");

    //TODO
    ctx.log("tokenregistry.transferOwnership ok");
}

pub fn func_update_metadata(ctx: &ScFuncContext) {
    ctx.log("tokenregistry.updateMetadata");
    //TODO the one who can change the token info
    ctx.require(ctx.caller() == ctx.contract_creator(), "no permission");

    let p = ctx.params();
    let param_color = p.get_color(PARAM_COLOR);
    ctx.require(param_color.exists(), "missing mandatory color");

    //TODO
    ctx.log("tokenregistry.updateMetadata ok");
}

pub fn view_get_info(ctx: &ScViewContext) {
    ctx.log("tokenregistry.getInfo");
    let p = ctx.params();
    let param_color = p.get_color(PARAM_COLOR);
    ctx.require(param_color.exists(), "missing mandatory color");

    //TODO
    ctx.log("tokenregistry.getInfo ok");
}
