jQuery(document).ready(function($) {
    function getParams() {
        const url = window.location.href;
        var queryString = url.substring(url.indexOf('?') + 1);
        var paramsArr = queryString.split('&');
        var params = [];

        for (var i = 0, len = paramsArr.length; i < len; i++) {
            var keyValuePair = paramsArr[i].split('=');
            params.push({
                name: keyValuePair[0],
                value: keyValuePair[1]
            });
        }

        return params;
    }
    searchUser("frad");
    function searchUser(name){
        for (const user of dz_autopoints.users){
            if(user.user_login.toLowerCase() == name){
                return user.ID;
            }
        };
        return false;
    }
    function saveMeta(form_id){
        entrystr = window.location.hash.substr(1);
        entryid = entrystr.split("/")[2]
        $.ajax({
            url: dz_autopoints.ajaxurl,
            method: 'POST',
            data: {
                action: 'dz_autopoints_disable',
                form_id: form_id,
                entry_id: entryid,
            },
            success: function( response ) {

                // Update the points preview
                if( response.data !== undefined ) {
                    console.log(response.data);
                    $("#add_point").html('<input id="add_point" class="el-button el-button--primary el-button--small" type="button" style="margin-top:20px;background: rgba(255,255,255,.5);border-color: rgba(220,220,222,.75);box-shadow: inset 0 1px 2px rgba(0,0,0,.04);color: rgba(44,51,56,.5);" value="Añadir Puntos" />');
                    $("#add_point").attr('disabled', true)
                    $("#add_point").attr('style', 'margin-top:20px;background: rgba(255,255,255,.5);border-color: rgba(220,220,222,.75);box-shadow: inset 0 1px 2px rgba(0,0,0,.04);color: rgba(44,51,56,.5);')
                    alert("Guardado!");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                console.log("Status: " + textStatus); 
                console.log("Error: " + errorThrown); 
                console.log(XMLHttpRequest); 

            } 
        });
    }
    function delay (ms) {
        return new Promise((resolve,reject) => setTimeout(resolve,ms));
    }
    async function sendPoints(earnings_text,id,type,username,points){
        return new Promise((resolve,reject) => {
            var points_type = type;
            var user_id = id.toString();
            console.log(username)
            console.log(type)

            $.ajax({
                url: dz_autopoints.ajaxurl,
                method: 'POST',
                data: {
                    action: 'dz_autopoints_profile_update_user_points',
                    nonce: dz_autopoints.nonce,
                    points: points,
                    points_type: points_type,
                    register_movement: 1,
                    earnings_text: earnings_text,
                    user_id: user_id,
                },
                success: async function( response ) {

                    // Update the points preview
                    if( response.data !== undefined ) {
                        console.log("points increased");
                        console.log(response.data);
                        console.log(type)
                        console.log(username);
                        if(response.data == "Invalid user ID."){
                            alert(username+" No es valido, ID no encontrada");
                        }
                        await delay (5000);
                        resolve(true);
                    }
                },
                error: async function(XMLHttpRequest, textStatus, errorThrown) { 
                    console.log("Status: "); 
                    console.log(textStatus); 
                    console.log("Error: "); 
                    console.log(errorThrown); 
                    console.log(XMLHttpRequest); 
                    await delay (5000);
                    resolve(true);

                } 
            });
        });
    }
    entrystr = window.location.hash.substr(1);
    entryid = entrystr.split("/")[2]
    formid = getParams()[2].value.split("#")[0];
    $.ajax({
        url: dz_autopoints.ajaxurl,
        method: 'POST',
        data: {
            action: 'dz_autopoints_check',
            entry_id: entryid,
            form_id: formid,
        },
        success: function( response ) {

                // Update the points preview
            if( response.data !== undefined ) {
                console.log("points increased");
                console.log(response.data);
                loadButton(response.data);
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            console.log("Status: "); 
            console.log(textStatus); 
            console.log("Error: "); 
            console.log(errorThrown); 
            console.log(XMLHttpRequest); 

        } 
    });
    function loadButton(disabled){
    	setTimeout(function(){
            var dzpoints= $('<div><label for="dz_points">Puntos DZ Experience</label><input type="number" min="0" step="1" value="1" id="dz_points" name="dz_points" /></div>');
            var allpoints= $('<div><label for="all_points">Puntos generales</label><input type="number" min="0" step="1" value="1" id="all_points" name="all_points" /></div>');
    		if(disabled == "disabled"){
                console.log(disabled)
                var button= $('<input id="add_point" disabled class="el-button el-button--primary el-button--small" type="button" style="margin-top:20px;background: rgba(255,255,255,.5);border-color: rgba(220,220,222,.75);box-shadow: inset 0 1px 2px rgba(0,0,0,.04);color: rgba(44,51,56,.5);" value="Añadir Puntos" />');
            }else{
                var button= $('<input id="add_point" class="el-button el-button--primary el-button--small" type="button" style="margin-top:20px;" value="Añadir Puntos" />');
            }
            var loading = '<div><label for="bar">Progreso:</label><progress id="bar" name="bar" value="0" max="8">0%</progress></div>';
            $("#ff_form_entries_app > div > div:nth-child(2) > div > div.el-col.el-col-24.el-col-lg-8 > .entry_info_box").append(button);
            $("#ff_form_entries_app > div > div:nth-child(2) > div > div.el-col.el-col-24.el-col-lg-8 > .entry_info_box").append(dzpoints);
            $("#ff_form_entries_app > div > div:nth-child(2) > div > div.el-col.el-col-24.el-col-lg-8 > .entry_info_box").append(allpoints);
            $("#ff_form_entries_app > div > div:nth-child(2) > div > div.el-col.el-col-24.el-col-lg-8 > .entry_info_box").append(loading);
            
    	}, 1000)

    }
	$(document).on("click","#add_point",async function(){
		var earnings_text = "";
        var dzpoints = $("#dz_points").val();
        var allpoints = $("#all_points").val();
        console.log("dzpoints")
        console.log(dzpoints)
        console.log("allpoints")
        console.log(allpoints)
        for (const label of $(".wpf_each_entry").find(".wpf_entry_label")){
            console.log($(label).text().trim());
            if($(label).text().trim() == "Tipo de Actividad o evento (Type of activity or event)") {
                if($(label).next().text().trim() != ""){
                    earnings_text = $(label).next().text().trim()
                }
            }
            if($(label).text().trim() == "DZ Experience") {
                if($(label).next().text().trim() != ""){
                    points_type = "expdz";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,dzpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Tracker-Interceptor") {
                if($(label).next().text().trim() != ""){
                    points_type = "trackerinterceptor";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Engineering") {
                if($(label).next().text().trim() != ""){
                    points_type = "engineering";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Forge") {
                if($(label).next().text().trim() != ""){
                    points_type = "forge";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Squadron") {
                if($(label).next().text().trim() != ""){
                    points_type = "squadron";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Squad") {
                if($(label).next().text().trim() != ""){
                    points_type = "squad";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Sawbones") {
                if($(label).next().text().trim() != ""){
                    points_type = "sawbones";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Gunner") {
                if($(label).next().text().trim() != ""){
                    points_type = "gunner";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
            if($(label).text().trim() == "Logistics") {
                if($(label).next().text().trim() != ""){
                    points_type = "logistics";
                    for (const elm of $(label).next().find("li")){
                        username = $(elm).text().trim().toLowerCase();
                        await sendPoints(earnings_text,searchUser(username),points_type,username,allpoints);
                    };
                }
                currentval = $("#bar").val();
                $("#bar").val(parseInt(currentval)+1);
            }
        };
        saveMeta(dz_autopoints.form_id);
	});
});