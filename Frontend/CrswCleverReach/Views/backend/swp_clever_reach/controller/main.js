//{namespace name=backend/swp_clever_reach/snippets}
Ext.define('Shopware.apps.SwpCleverReach.controller.Main', {
    extend: 'Ext.app.Controller',

    stores: [ 'Config', 'Setting', 'Assignment', 'Group', 'Form', 'Shop' ],
    models: [ 'Config', 'Setting', 'Assignment', 'Group', 'Form','Shop' ],

    views: [ 'main.Window', 'main.Install', 'main.FirstExport', 'main.Assignments', 'main.Settings' ],

    mainWindow: null,

    snippets: {
        messages: {
            title_success : '{s name=clever_reach/messages/title_success}Daten gültig{/s}',
            text_success : '{s name=clever_reach/messages/text_success}Die Daten sind gültig{/s}',
            title_error : '{s name=clever_reach/messages/title_error}Daten ungültig{/s}',
            text_error : '{s name=clever_reach/messages/text_error}Die Daten sind ungültig{/s}',
            title_error_msg : '{s name=clever_reach/messages/title_error_msg}Fehler{/s}',
            text_error_msg : '{s name=clever_reach/messages/text_error_msg}Beim Laden der Daten ist ein Fehler aufgetreten...{/s}',
            title_reset : '{s name=clever_reach/messages/title_reset}Reset{/s}',
            confirm_reset : '{s name=clever_reach/messages/confirm_reset}Sind Sie sicher, dass Sie die Zuweisungen zurücksetzen möchten?{/s}',
            text_reset : '{s name=clever_reach/messages/text_reset}Die Daten sind gültig{/s}',
            module : '{s name=clever_reach/messages/module}CleverReach{/s}'
        }
    },
    /**
     * init stores and display the window
     */
    init: function() {
        var me = this;

        me.control({
            'swp_clever_reach-install': {
                saveAndCheck: me.onSaveAndCheck,
                onReset: me.onReset
            },
            'swp_clever_reach-install-settings': {
                /*edit: me.onEditSettings,*/
                onProductsSearch: me.onProductsSearch
            },
            'swp_clever_reach-assignments': {
                'beforeedit': me.onBeforeEditAssignment,
                'edit': me.onEditAssignment
            },
            'swp_clever_reach-first-export button': {
                'click': me.onFirstExport
            }
        });

        //init stores
        me.mainWindow = me.getView('main.Window').create().show();
        me.mainWindow.setLoading(true);
        me.configsStore = me.getStore('Config');
        me.mainWindow.assignmentsStore = me.getStore('Assignment');
        me.mainWindow.formsStore = me.getStore('Form');
        me.mainWindow.groupsStore = me.getStore('Group');
        me.mainWindow.groupsStore.on('load', me.onLoadGroup, me);
        me.mainWindow.settingsStore = me.getStore('Setting').load();
        me.mainWindow.shopsStore = me.getStore('Shop').load({
            callback: function(srecords)
            {
                me.configsStore.load({
                    callback: function(records)
                    {
                        var configs = records[0];
                        me.mainWindow.configs = configs;
                        me.mainWindow.createTabPanel();
                        me.checkAPI();
                    }
                });
            }
        });

        me.callParent(arguments);
    },
    /**
     * make a to CleverReach API in order to check the connection status
     */
    checkAPI: function() {
        var me = this,
        form = me.mainWindow.installForm.getForm();

        Ext.Ajax.request({
            url: '{url action=checkAPI}',
            params: {
                api_key: form.findField("api_key").getValue(),
                wsdl_url: form.findField("wsdl_url").getValue()
            },
            success: function(response, operation)
            {
                response = Ext.decode(response.responseText);
                if (response.success)
                {
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_success, me.snippets.messages.text_success, me.snippets.messages.module);
                    //load groups, forms, assignments
                    me.mainWindow.groupsStore.load();
                }
                else
                {
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, me.snippets.messages.text_error, me.snippets.messages.module);
                    me.setTabsDisabled(true);
                    me.mainWindow.setLoading(false);
                }
                me.configsStore.load({
                    callback: function(records)
                    {
                        var configs = records[0];
                        me.mainWindow.configs = configs;
                        me.mainWindow.installForm.configs = configs;
                        me.mainWindow.installForm.loadRecord(me.mainWindow.configs);
                        var status_field = me.mainWindow.installForm.getForm().findField('status');
                        status_field.fireEvent('render', status_field);
                    }
                });
            },
            failure: function(response)
            {
                response = response.statusText;
                Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, response, me.snippets.messages.module);
                me.setTabsDisabled(true);
                me.mainWindow.setLoading(false);
            }
        });
    },
    /**
     * the tabs will be enabled only in case the connection to CleverReach is made
     */
    setTabsDisabled: function(value) {
        var me = this;

        //me.mainWindow.tabpanel.items.items[1].setDisabled(value);
        me.mainWindow.first_exportForm.setDisabled(value);
        me.mainWindow.installForm.settingsGrid.setDisabled(value);
        me.mainWindow.installForm.groupsForm.setDisabled(value);
    },
    /**
     * save api_key and wsdl_url; check the connection afterwards
     */
    onSaveAndCheck: function(view) {
        var me = this,
        form = view.getForm(),
        record = me.configsStore.getAt(0);
        
        me.mainWindow.setLoading(true);

        record.set("api_key", form.findField("api_key").getValue());
        record.set("wsdl_url", form.findField("wsdl_url").getValue());
        if (!record.dirty) {
            //the values were not changed => just checkAPI
            me.checkAPI();
            return;
        }
        me.configsStore.sync({
            success: function(response, operation){
                response = me.configsStore.getProxy().getReader().rawData;
                if (response.success)
                {
                    me.checkAPI();
                }
                else
                {
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, me.snippets.messages.text_error, me.snippets.messages.module);
                    me.mainWindow.setLoading(false);
                }
            },
            failure: function(response){
                response = me.configsStore.getProxy().getReader().rawData.message;
                Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, response, me.snippets.messages.module);
                me.mainWindow.setLoading(false);
            },
            scope: this
        });
    },
    /**
     * edit settings: export_limit, opt-in feature, extra info
     */
    /*onEditSettings: function(editor, event) {
        var me     = this,
        record = event.record;

        if (!record.dirty) {
            return;
        }
        editor.grid.setLoading(true);
        record.save({
            success: function() {
                editor.grid.store.load({
                    callback: function() {
                        editor.grid.setLoading(false);
                    }
                });
            },
            failure: function(response, opt) {
                response = me.configsStore.getProxy().getReader().rawData.message;
                Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, response, me.snippets.messages.module);
                editor.grid.setLoading(false);
            }
        });
    },*/
    /**
     * after the subscriberes groups are loaded, create a store with all the forms
     * load the assignemnts afterwards
     */
    onLoadGroup: function(store, records, success) {
        var me = this;

        if (success !== true || !records.length) {
            if(success !== true){
                var message;
                if(store.getProxy().getReader().rawData){
                    message = store.getProxy().getReader().rawData.message;
                }else{
                    message = me.snippets.messages.text_error_msg;
                }
                Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error_msg, message, me.snippets.messages.module);
            }
            me.mainWindow.setLoading(false);
            return;
        }
        //create formStore with distinct forms (they should be distinct anyway but...)
        store.each(function(record)
        {
            record.getForms().each(function(form_record)
            {
                var id =  form_record.get('id'),
                form_record2 =  me.mainWindow.formsStore.getById(id);
                if (form_record2 instanceof Ext.data.Model) {
                //nothing to do; the record is already added
                } else {
                    me.mainWindow.formsStore.add([form_record]);
                }
            });
        });
        //load assignments
        me.mainWindow.assignmentsStore.load({
            callback: function(records, response)
            {
                me.mainWindow.setLoading(false);
                if(!response.success){
                    response = response.error.statusText;
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error_msg, response, me.snippets.messages.module);
                    return;
                }
                me.setTabsDisabled(false);
            }
        });
    },
    /**
     * refresh the forms (just display the forms associated with the selected group) when the groups/forms are edited
     */
    onBeforeEditAssignment: function(editor, e){
        var me = this,
        combo = editor.grid.getPlugin('rowEditing').editor.form.findField('formID');

        combo.bindStore(me.mainWindow.groupsStore.getById(e.record.get('listID')).getForms());
    },
    /**
     * save assignment
     */
    onEditAssignment: function(editor, event) {
        var me     = this,
        record = event.record;

        if (!record.dirty) {
            return;
        }

        editor.grid.setLoading(true);
        editor.grid.store.loadData([record], true);
        editor.grid.store.sync({
            success: function(response, operation){
                //refresh settings grid
                me.mainWindow.settingsStore.load({
                    callback: function(records, response)
                    {
                        editor.grid.setLoading(false);

                    }
                });
            },
            failure: function(response){
                response = editor.grid.store.getProxy().getReader().rawData.message;
                Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error_msg, response, me.snippets.messages.module);
                editor.grid.setLoading(false);
            },
            scope: this
        });
    },
    /**
     * first export
     */
    onFirstExport: function(button) {
        var me = this,
        action = 'first_export',
        shopId = button.shopId,
        url = '{url controller=SwpCleverReachExport action=firstExport}',
        resultsPanel = button.up('form').query('panel[name=apiResults]')[0],
        export_limit = button.up('form').query('numberfield[name=export_limit][shopId='+shopId+']')[0].getValue(),
        settingsStore = me.mainWindow.settingsStore,
        index = settingsStore.findExact('shopId', shopId),
        record = settingsStore.getAt(index);

        me.mainWindow.setLoading(true);
        
        //clear previous results
        resultsPanel.update("");
        //save export_limit
        if(record.get('export_limit') != export_limit){
            //export
            record.set('export_limit', export_limit);
            settingsStore.sync({
                success: function(response, operation){
                    me.callAPI(url, shopId, resultsPanel, action);
                },
                failure: function(response){
                    response = settingsStore.getProxy().getReader().rawData.message;
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error_msg, response, me.snippets.messages.module);
                    me.mainWindow.setLoading(false);
                },
                scope: this
            });
        }
        else{
            me.callAPI(url, shopId, resultsPanel, action);
        }
    },
    /**
     * products search activation
     */
    onProductsSearch: function(record) {
        var me = this,
        action = 'products_search',
        shopId = record.get('shopId'),
        url = '{url controller=SwpCleverReachRegisterProductsSearch action=registerProductsSearch}',
        resultsPanel = null;

        me.mainWindow.setLoading(true);
        
        me.callAPI(url, shopId, resultsPanel, action);
    },
    /**
     * first export or products search activation - call API method
     */
    callAPI: function(url, shopId, resultsPanel, action) {
        var me = this;

        Ext.Ajax.timeout = 300000;
        Ext.Ajax.request({
            url: url,
            params: {
                shopID: shopId
            },
            success: function(response, operation)
            {
                response = Ext.decode(response.responseText);
                if (response.success)
                {
                    if(resultsPanel != null){
                        resultsPanel.update(response.message);
                    }else{
                        Shopware.Notification.createGrowlMessage(me.snippets.messages.title_success, response.message, me.snippets.messages.module);
                    }
                    if(response.next_target){
                        //call API again
                        me.callAPI(response.next_target, shopId, resultsPanel, action);
                    }else{
                        //it's finished
                        me.setSettingsAsChecked(shopId, action);
                    }
                }
                else
                {
                    me.mainWindow.setLoading(false);
                    var message = me.snippets.messages.text_error;
                    if(response.message){
                        message = response.message;
                    }
                    if(resultsPanel != null){
                        resultsPanel.update(message);
                    }
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, message, me.snippets.messages.module);
                }
            },
            failure: function(response)
            {
                me.mainWindow.setLoading(false);
                response = response.statusText;
                Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, response, me.snippets.messages.module);
            }
        });
    },
    /**
     * callAPI was ok so we'll mark this action as checked
     */
    setSettingsAsChecked: function(shopId, action) {
        var me = this;

        Ext.Ajax.request({
            url: "{url action=setSettingsAsChecked}",
            params: {
                shopId: shopId,
                name: action
            },
            success: function(response, operation)
            {
                response = Ext.decode(response.responseText);
                if (response.success)
                {
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_success, me.snippets.messages.text_success, me.snippets.messages.module);
                    //refresh settings grid
                    me.mainWindow.settingsStore.load({
                        callback: function(records, response)
                        {
                            me.mainWindow.setLoading(false);
                        }
                    });
                }
                else
                {
                    me.mainWindow.setLoading(false);
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, me.snippets.messages.text_error, me.snippets.messages.module);
                }
            },
            failure: function(response)
            {
                me.mainWindow.setLoading(false);
                response = response.statusText;
                Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error, response, me.snippets.messages.module);
            }
        });
    },
    /**
     * products search activation
     */
    onReset: function() {
        var me = this,
            export_fields = me.mainWindow.first_exportForm.query('numberfield[name=export_limit]');

        Ext.MessageBox.confirm(me.snippets.messages.title_reset, me.snippets.messages.confirm_reset, function (response) {
            if (response !== 'yes') {
                return false;
            }
        
            me.mainWindow.setLoading(true);

            Ext.Ajax.request({
                url: "{url action=resetCleverReach}",
                success: function(response, operation)
                {
                    response = Ext.decode(response.responseText);
                    if (response.success)
                    {
                        Shopware.Notification.createGrowlMessage(me.snippets.messages.title_reset, me.snippets.messages.text_reset, me.snippets.messages.module);
                        //refresh groups grid
                        me.mainWindow.groupsStore.load({
                            callback: function(records, response)
                            {
                                //refresh settings grid
                                me.mainWindow.settingsStore.load({
                                    callback: function(records, response)
                                    {
                                        //refresh shops grid
                                        me.mainWindow.shopsStore.load({
                                            callback: function(records, response)
                                            {
                                                for(var i=0; i < export_fields.length; i++)
                                                {
                                                    export_fields[i].setValue(50);
                                                }
                                                me.mainWindow.setLoading(false);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else
                    {
                        me.mainWindow.setLoading(false);
                        Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error_msg, me.snippets.messages.text_error_msg, me.snippets.messages.module);
                    }
                },
                failure: function(response)
                {
                    me.mainWindow.setLoading(false);
                    response = response.statusText;
                    Shopware.Notification.createGrowlMessage(me.snippets.messages.title_error_msg, response, me.snippets.messages.module);
                }
            });
        });
    }
});