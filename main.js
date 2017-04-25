const config = require("./config");
const chat = jcmp.events.Call('get_chat')[0];
const m_c = "[#AA18C7]"; // Color of chat messages

jcmp.events.Add('PlayerReady', (player) => 
{
    jcmp.events.CallRemote('warpgui/AddPlayer', null, player.networkId, player.name);
})

jcmp.events.AddRemoteCallable('warpgui/AcceptWarp', (player, id) => {
    id = parseInt(id);
    let target = jcmp.players.find(p => p.networkId == id);
    if (target == null || typeof target == 'undefined')
    {
        chat.send(player, m_c + "[Warp] Accept warp failed! No valid player was found.");
        return;
    }
    target.position = player.position;
    chat.send(player, m_c + "[Warp] " + target.name + " warped to you.");
    chat.send(target, m_c + "[Warp] You warped to " + player.name + " successfully.");
})

jcmp.events.AddRemoteCallable('warpgui/WarpHere', (player, id) => {
    id = parseInt(id);
    if (!is_admin(player))
    {
        chat.send(player, m_c + "[Warp] Generic error. Please contact an admin for assistance.");
        return; // Warping other players is only for admins
    }

    let target = jcmp.players.find(p => p.networkId == id);
    if (target == null || typeof target == 'undefined')
    {
        chat.send(player, m_c + "[Warp] Warp player here failed! No valid player was found.");
        return;
    }
    target.position = player.position;
    chat.send(player, m_c + "[Warp] You warped " + target.name + " to you successfully.");
})

jcmp.events.AddRemoteCallable('warpgui/WarpTo', (player, id) => {
    id = parseInt(id);
    let target = jcmp.players.find(p => p.networkId == id);
    if (target == null || typeof target == 'undefined')
    {
        chat.send(player, m_c + "[Warp] Warp to player failed! No valid player was found.");
        return;
    }
    if (is_admin(player))
    {
        player.position = target.position;
        chat.send(player, m_c + "[Warp] You warped to " + target.name + " successfully.");
    }
    else
    {
        jcmp.events.CallRemote('warpgui/AddAcceptWarp', target, player.networkId);
        chat.send(player, m_c + "[Warp] Waiting for " + target.name + " to accept warp request...");
        chat.send(target, m_c + "[Warp] " + player.name + " has requested to warp to you. Open the Warp menu with F9 to accept.");
    }
})

jcmp.events.AddRemoteCallable('warpgui/GUIReady', (player) => 
{
    const c = {
        open_key: config.open_key,
        admin_only: config.admin_only,
        admin: is_admin(player)
    }
    jcmp.events.CallRemote('warpgui/InitConfig', player, JSON.stringify(c));

    let data = [];
    jcmp.players.forEach(function(p) 
    {
        data.push({id: p.networkId, name: p.name});
    });
    jcmp.events.CallRemote('warpgui/InitPlayers', player, JSON.stringify(data));

})

jcmp.events.Add('PlayerDestroyed', (player) => {
    jcmp.events.CallRemote('warpgui/RemovePlayer', null, player.networkId);
})

function is_admin(player)
{
    return typeof config.admins.find(id => player.client.steamId == id) != 'undefined';
}