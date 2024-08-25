function config(cfgs, opts){
    for (let key of Object.keys(opts))
        workflow.options[key] = opts[key];
    for (let key of Object.keys(cfgs))
        workflow.config[key] = cfgs[key];
}

//---------------------------------------------------------------------------------------------------------------
// Synthetic Item Suite
//    Used to create temporary items that do not exist on the character sheet
//    These are helpful when you want to modify an item without actually modifying the item
//    Alternatively if you want to call an item on an actor that does not have that item currently
//
//  Mini-Guide:
//    https://github.com/MotoMoto1234/Midi-Wiki/wiki/Tutorials-‐-How-to-Make-CPR-Actions-in-Token-Action-Hud
//---------------------------------------------------------------------------------------------------------------

async function syntheticItem(itemData, actor, updates) {
    let item;
    updates.synthetic = true;

    if (itemData.synthetic && itemData.parent == actor) {
        // Some way to determine if we have already made a synthetic object possibly in a prior stage to shortcut
        item = itemData;
    } else if (macroUtil.moduleApi.activated('chris-premades')) {
        item = await chrisPremades.utils.itemUtils.syntheticItem(itemData, actor);
    } else { // Scraped from CPR 08/24/2024
        item = new CONFIG.Item.documentClass(itemData, {parent: actor});
        item.prepareData();
        item.prepareFinalAttributes();
        item.applyActiveEffects();
    }
    return foundry.utils.mergeObject(item, updates);
}

async function syntheticItemDataRoll(itemData, actor, targets, {options = {}, config = {}} = {}) {
    if (macroUtil.moduleApi.activated('chris-premades'))
        return await chrisPremades.utils.workflowUtils.syntheticItemDataRoll(item, targets, {options: options, config: config});
    else { // Scraped from CPR 08/24/2024
        let item = await syntheticItem(itemData, actor);
        return await syntheticItemRoll(item, targets, {options, config});
    }
}

async function syntheticItemRoll(item, targets, {options = {}, config = {}} = {}) {
    if (macroUtil.moduleApi.activated('chris-premades'))
        return chrisPremades.utils.workflowUtils.syntheticItemRoll(item, targets, {options: options, config: config} = {});
    else {  // Scraped from CPR 08/24/2024
        let defaultConfig = {
            consumeUsage: false,
            consumeSpellSlot: false
        };
        let defaultOptions = {
            targetUuids: targets.map(i => i.document.uuid),
            configureDialog: false,
            ignoreUserTargets: true,
            workflowOptions: {
                autoRollDamage: 'always',
                autoFastDamage: true,
                autoRollAttack: true
            }
        };
        options = foundry.utils.mergeObject(defaultOptions, options);
        config = foundry.utils.mergeObject(defaultConfig, config);
        return await MidiQOL.completeItemUse(item, config, options);
    }
}

const preItemRoll = {
    config,
};

export const itemApi = { 
    syntheticItem,
    syntheticItemRoll,
    syntheticItemDataRoll,
    preItemRoll,
};
