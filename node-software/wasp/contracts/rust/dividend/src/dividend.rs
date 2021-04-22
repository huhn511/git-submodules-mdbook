// Copyright 2020 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

// This example implements 'dividend', a simple smart contract that will
// automatically disperse iota tokens which are sent to the contract to a group
// of member addresses according to predefined division factors. The intent is
// to showcase basic functionality of WasmLib through a minimal implementation
// and not to come up with a complete robust real-world solution.
// Note that we have drawn out constructs that could have been done in a single
// line over multiple statements to be able to properly document step by step
// what is happening in the code.

use wasmlib::*;

use crate::*;

// 'init' is used as a way to initialize a smart contract. It is an optional
// function that will automatically be called upon contract deployment. In this
// case we use it to initialize the 'owner' state variable so that we can later
// use this information to prevent non-owners from calling certain functions.
// The 'init' function takes a single optional parameter:
// - 'owner', which is the agent id of the entity owning the contract.
// When this parameter is omitted the owner will default to the contract creator.
pub fn func_init(ctx: &ScFuncContext) {

    // Log initiation of the 'init' Func in the host log.
    ctx.log("dividend.init");

    // First we set up a default value for the owner in case the optional
    // 'owner' parameter was omitted.
    let mut owner: ScAgentId = ctx.contract_creator();

    // Now it is time to check if parameters were provided to the function.
    // We create an ScImmutableMap proxy to the params map on the host.
    let p: ScImmutableMap = ctx.params();

    // Then we create an ScImmutableAgentId proxy to the 'owner' parameter.
    let param_owner: ScImmutableAgentId = p.get_agent_id(PARAM_OWNER);

    // Now we check if the optional 'owner' parameter is present in the params map.
    if param_owner.exists() {
        // Yes, it was present, so now we overwrite the default owner with
        // the one specified by the 'owner' parameter.
        owner = param_owner.value();
    }

    // Now that we have sorted out which agent will be the owner of this contract
    // we will save this value in the state storage on the host. First we create
    // an ScMutableMap proxy that refers to the state storage map on the host.
    let state: ScMutableMap = ctx.state();

    // Then we create an ScMutableAgentId proxy to an 'owner' variable in state storage.
    let state_owner: ScMutableAgentId = state.get_agent_id(VAR_OWNER);

    // And then we save the owner value in the 'owner' variable in state storage.
    state_owner.set_value(&owner);

    // Log successful completion of the 'init' Func in the host log.
    ctx.log("dividend.init ok");
}

// 'member' is a function that can be used only by the entity that owns the
// 'dividend' smart contract. It can be used to define the group of member
// addresses and dispersal factors one by one prior to sending tokens to the
// smart contract's 'divide' function. The 'member' function takes 2 parameters,
// which are both required:
// - 'address', which is an Address to use as member in the group, and
// - 'factor',  which is an Int64 relative dispersal factor associated with
//              that address
// The 'member' function will save the address/factor combination in its state
// storage and also calculate and store a running sum of all factors so that the
// 'divide' function can simply start using these precalculated values
pub fn func_member(ctx: &ScFuncContext) {

    // Log initiation of the 'member' Func in the host log.
    ctx.log("dividend.member");

    // The 'init' func previously determined which agent is the owner of this
    // contract and stored that value in the 'owner' variable in state storage.
    // So we start out by accessing state storage by creating an ScMutableMap
    // proxy that refers to the state storage map on the host.
    let state: ScMutableMap = ctx.state();

    // Next we create an ScMutableAgentId proxy to the 'owner' variable in state storage.
    let owner: ScMutableAgentId = state.get_agent_id(VAR_OWNER);

    // Only the defined smart contract owner can add members, so we require
    // that the caller's agent id is equal to the stored owner's agent id.
    // Otherwise we panic out with an error message.
    ctx.require(ctx.caller() == owner.value(), "no permission");

    // Now it is time to check the parameters that were provided to the function.
    // First we create an ScImmutableMap proxy to the params map on the host.
    let p: ScImmutableMap = ctx.params();

    // Create an ScImmutableAddress proxy to the 'address' parameter that is still
    // stored in the params map on the host. Note that we use constants defined in
    // consts.rs to prevent typos in name strings. This is good practice and will
    // save time in the long run.
    let param_address: ScImmutableAddress = p.get_address(PARAM_ADDRESS);

    // Require that the mandatory 'address' parameter actually exists in the map on
    // the host. If it doesn't we panic out with an error message.
    ctx.require(param_address.exists(), "missing mandatory address");

    // Now that we are sure that the 'address' parameter actually exists we can
    // retrieve its actual value into an ScAddress value type.
    let address: ScAddress = param_address.value();

    // Create an ScImmutableInt64 proxy to the 'factor' parameter that is still
    // stored in the map on the host. Note how the get_xxx() method defines what
    // type of parameter we expect. In this case it's an Int64 parameter.
    let param_factor: ScImmutableInt64 = p.get_int64(PARAM_FACTOR);

    // Require that the mandatory 'factor' parameter actually exists in the map on
    // the host. If it doesn't we panic out with an error message.
    ctx.require(param_factor.exists(), "missing mandatory factor");

    // Now that we are sure that the 'factor' parameter actually exists we can
    // retrieve its actual value into an i64. Note that we use Rust's built-in
    // data types when manipulating Int64, String, or Bytes value objects.
    let factor: i64 = param_factor.value();

    // As an extra requirement we check that the 'factor' parameter value is not
    // negative. If it is, we panic out with an error message.
    // Note how we use an if expression here. We could have achieved the same in a
    // single line by using the require() method instead:
    // ctx.require(factor >= 0, "negative factor");
    // Using the require() method reduces typing and enhances readability.
    if factor < 0 {
        ctx.panic("negative factor");
    }

    // We will store the address/factor combinations in a key/value sub-map inside
    // the state map. We tell the state map proxy to create an ScMutableMap proxy
    // to a map named 'members' in the state storage. If there is no 'members' map
    // present yet this will automatically create an empty map on the host.
    let members: ScMutableMap = state.get_map(VAR_MEMBERS);

    // Now we create an ScMutableInt64 proxy for the value stored in the 'members'
    // map under the key defined by the 'address' parameter we retrieved earlier.
    let current_factor: ScMutableInt64 = members.get_int64(&address);

    // Check to see if this key/value combination exists in the 'members' map
    if !current_factor.exists() {
        // If it does not exist yet then we have to add this new address to the
        // 'memberList' array. We tell the state map proxy to create an
        // ScMutableAddressArray proxy to an Address array named 'memberList' in
        // the state storage. Again, if the array was not present yet it will
        // automatically be created.
        let member_list: ScMutableAddressArray = state.get_address_array(VAR_MEMBER_LIST);

        // Now we will append the new address to the memberList array.
        // First we determine the current length of the array.
        let length: i32 = member_list.length();

        // Next we create an ScMutableAddress proxy to the Address value that lives
        // at that index in the memberList array (no value, since we're appending).
        let new_address: ScMutableAddress = member_list.get_address(length);

        // And finally we append the new address to the array by telling the proxy
        // to update the value it refers with the 'address' parameter.
        new_address.set_value(&address);
    }

    // Create an ScMutableInt64 proxy named 'totalFactor' for an Int64 value in
    // state storage. Note that we don't care whether this value exists or not,
    // because WasmLib will treat it as if it has the default value of zero.
    let total_factor: ScMutableInt64 = state.get_int64(VAR_TOTAL_FACTOR);

    // Now we calculate the new running total sum of factors by first getting the
    // current value of 'totalFactor' from the state storage, then subtracting the
    // current value of the factor associated with the 'address' parameter, if any
    // exists. Again, if the associated value doesn't exist, WasmLib will assume it
    // to be zero. Finally we add the factor retrieved from the parameters,
    // resulting in the new totalFactor.
    let new_total_factor: i64 = total_factor.value() - current_factor.value() + factor;

    // Now we store the new totalFactor in the state storage
    total_factor.set_value(new_total_factor);

    // And we also store the factor from the parameters under the address from the
    // parameters in the state storage that the proxy refers to
    current_factor.set_value(factor);

    // Log successful completion of the 'member' Func in the host log.
    ctx.log("dividend.member ok");
}

// 'divide' is a function that will take any iotas it receives and properly
// disperse them to the addresses in the member list according to the dispersion
// factors associated with these addresses.
// Anyone can send iota tokens to this function and they will automatically be
// passed on to the member list. Note that this function does not deal with
// fractions. It simply truncates the calculated amount to the nearest lower
// integer and keeps any remaining iotas in its own account. They will be added
// to any next round of tokens received prior to calculation of the new
// dispersion amounts.
pub fn func_divide(ctx: &ScFuncContext) {

    // Log initiation of the 'divide' Func in the host log.
    ctx.log("dividend.divide");

    // Create an ScBalances map proxy to the total account balances for this
    // smart contract. Note that ScBalances wraps an ScImmutableMap of token
    // color/amount combinations in a simpler to use interface.
    let balances: ScBalances = ctx.balances();

    // Retrieve the amount of plain iota tokens from the account balance
    let amount: i64 = balances.balance(&ScColor::IOTA);

    // Create an ScMutableMap proxy to the state storage map on the host.
    let state: ScMutableMap = ctx.state();

    // retrieve the pre-calculated totalFactor value from the state storage
    // through an ScmutableInt64 proxy
    let total_factor: i64 = state.get_int64(VAR_TOTAL_FACTOR).value();

    // note that it is useless to try to divide less than totalFactor iotas
    // because every member would receive zero iotas
    if amount < total_factor {
        // log the fact that we have nothing to do in the host log
        ctx.log("dividend.divide: nothing to divide");

        // And exit the function. Note that we could not have used a require()
        // statement here, because that would have indicated an error and caused
        // a panic out of the function, returning any amount of tokens that was
        // intended to be dispersed to the members. Returning normally will keep
        // these tokens in our account ready for dispersal in a next round.
        return;
    }

    // Create an ScMutableMap proxy to the 'members' map in the state storage.
    let members: ScMutableMap = state.get_map(VAR_MEMBERS);

    // Create an ScMutableAddressArray proxy to the 'memberList' Address array
    // in the state storage.
    let member_list: ScMutableAddressArray = state.get_address_array(VAR_MEMBER_LIST);

    // Determine the current length of the memberList array.
    let size: i32 = member_list.length();

    // loop through all indexes of the memberList array
    for i in 0..size {
        // Retrieve the next address from the memberList array through an
        // ScMutableAddress proxy that references the value at the required index.
        let address: ScAddress = member_list.get_address(i).value();

        // Retrieve the factor associated with the address from the members map
        // through an ScMutableInt64 proxy referencing the value in the map.
        let factor: i64 = members.get_int64(&address).value();

        // calculate the fair share of iotas to disperse to this member based on the
        // factor we just retrieved. Note that the result will been truncated.
        let share: i64 = amount * factor / total_factor;

        // is there anything to disperse to this member?
        if share > 0 {
            // Yes, so let's set up an ScTransfers map proxy that transfers the
            // calculated amount of iotas. Note that ScTransfers wraps an
            // ScMutableMap of token color/amount combinations in a simpler to use
            // interface. The constructor we use here creates and initializes a
            // single token color transfer in a single statement. The actual color
            // and amount values passed in will be stored in a new map on the host.
            let transfers: ScTransfers = ScTransfers::iotas(share);

            // Perform the actual transfer of tokens from the smart contract to the
            // member address. The transfer_to_address() method receives the address
            // value and the proxy to the new transfers map on the host, and will
            // call the corresponding host sandbox function with these values.
            ctx.transfer_to_address(&address, transfers);
        }
    }

    // Log successful completion of the 'divide' Func in the host log.
    ctx.log("dividend.divide ok");
}

// 'setOwner' is used to change the owner of the smart contract.
// It updates the 'owner' state variable with the provided agent id.
// The 'setOwner' function takes a single mandatory parameter:
// - 'owner', which is the agent id of the entity that will own the contract.
// Only the current owner can change the owner.
pub fn func_set_owner(ctx: &ScFuncContext) {

    // Log initiation of the 'setOwner' Func in the host log.
    ctx.log("dividend.setOwner");

    // Get a proxy to the 'owner' variable in state storage.
    let state_owner: ScMutableAgentId = ctx.state().get_agent_id(VAR_OWNER);

    // Require the caller to be the current owner.
    ctx.require(ctx.caller() == state_owner.value(), "no permission");

    // Get a proxy to the 'owner' parameter.
    let param_owner: ScImmutableAgentId = ctx.params().get_agent_id(PARAM_OWNER);

    // Require that the 'owner' parameter is mandatory.
    ctx.require(param_owner.exists(), "missing mandatory owner");

    // Save the new owner parameter value in the 'owner' variable in state storage.
    state_owner.set_value(&param_owner.value());

    // Log successful completion of the 'setOwner' Func in the host log.
    ctx.log("dividend.setOwner ok");
}

// 'getFactor' is a simple View function. It will retrieve the factor
// associated with the (mandatory) address parameter it was provided with.
pub fn view_get_factor(ctx: &ScViewContext) {

    // Log initiation of the 'getFactor' View in the host log.
    ctx.log("dividend.getFactor");

    // Now it is time to check the mandatory parameter.
    // First we create an ScImmutableMap proxy to the params map on the host.
    let p: ScImmutableMap = ctx.params();

    // Create an ScImmutableAddress proxy to the 'address' parameter that is
    // still stored in the map on the host.
    let param_address: ScImmutableAddress = p.get_address(PARAM_ADDRESS);

    // Require that the mandatory 'address' parameter actually exists in the map
    // on the host. If it doesn't we panic out with an error message.
    ctx.require(param_address.exists(), "missing mandatory address");

    // Now that we are sure that the 'address' parameter actually exists we can
    // retrieve its actual value into an ScAddress value type.
    let address: ScAddress = param_address.value();

    // Now that we have sorted out the parameter we will access the state
    // storage on the host. First we create an ScImmutableMap proxy to the state
    // storage map on the host. Note that this is an *immutable* map, as opposed
    // to the *mutable* map we get when we call the state() method on an
    // ScFuncContext.
    let state: ScImmutableMap = ctx.state();

    // Create an ScImmutableMap proxy to the 'members' map in the state storage.
    // Note that again, this is an *immutable* map as opposed to the *mutable*
    // map we get from the *mutable* state map we get through ScFuncContext.
    let members: ScImmutableMap = state.get_map(VAR_MEMBERS);

    // Retrieve the factor associated with the address parameter through
    // an ScImmutableInt64 proxy to the value stored in the 'members' map.
    let factor: i64 = members.get_int64(&address).value();

    // Create an ScMutableMap proxy to the map on the host that will store
    // the key/value pairs that we want to return from this View function.
    let results: ScMutableMap = ctx.results();

    // Set the value associated with the 'factor' key to the factor we got from
    // the members map through an ScMutableInt64 proxy to the results map.
    results.get_int64(VAR_FACTOR).set_value(factor);

    // Log successful completion of the 'getFactor' View in the host log.
    ctx.log("dividend.getFactor ok");
}
