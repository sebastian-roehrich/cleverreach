//{namespace name=backend/swp_clever_reach/snippets}
Ext.define('Shopware.apps.SwpCleverReach.view.main.Install', {
    extend: 'Ext.form.Panel',
    alias: 'widget.swp_clever_reach-install',
    autoScroll: true,
    cls: 'shopware-form',
    layout: {
        type: 'vbox',
        align : 'stretch',
        pack  : 'start'
    },
    border: false,
    defaults: {
        anchor: '100%',
        margin: '0 10 0 10'
    },

    snippets: {
        title: '{s name="install_title"}Einstellungen{/s}',
        buttons: {
            save_and_status: '{s name="buttons/save_and_status"}Speichern und Status prüfen{/s}',
            log_in: '{s name="buttons/log_in"}Anmelden{/s}',
            reset: '{s name="buttons/reset"}Reset{/s}'
        },
        api: {
            title: '{s name="api/title"}API{/s}',
            api_key: '{s name="api/api_key"}API-Key{/s}',
            wsdl_url: '{s name="api/wsdl_url"}WSDL-URL{/s}',
            status: '{s name="api/status"}Status{/s}',
            tested_on: '{s name="api/tested_on"}tested on{/s}'
        }
    },

    initComponent: function()
    {
        var me = this;
        me.title = me.snippets.title;

        me.items = me.getItems();
        me.addEvents('saveAndCheck', 'onReset');

        me.dockedItems = [{
            xtype: 'toolbar',
            cls: 'shopware-toolbar',
            dock: 'bottom',
            ui: 'shopware-ui',
            items: ['->'/*, {
                xtype: 'button',
                cls: 'secondary',
                text: me.snippets.buttons.save_and_status,
                handler: function()
                {
                    me.fireEvent('saveAndCheck', me);
                }
            }, {
                xtype: 'button',
                cls: 'primary',
                text: me.snippets.buttons.log_in,
                handler: function()
                {
                    window.open('http://www.cleverreach.de/frontend/?rk=shopware', '', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=1200, height=800');
                }
            }*/, {
                xtype: 'button',
                text: me.snippets.buttons.reset,
                handler: function()
                {
                    me.fireEvent('onReset', me);
                }
            }]
        }];

        me.callParent(arguments);
        me.loadRecord(me.configs);
    },

    getItems: function()
    {
        var me = this;
        me.apiFiledset = Ext.create('Ext.form.FieldSet', {
            title: me.snippets.api.title,
            flex:3,
            layout: 'anchor',
            collapsible: true,
            defaults: {
                anchor: '100%',
                labelWidth: '10%'
            },
            items: [{
                xtype: 'textfield',
                fieldLabel: me.snippets.api.api_key,
                name: 'api_key'
            },
            {
                xtype: 'textfield',
                fieldLabel: me.snippets.api.wsdl_url,
                name: 'wsdl_url'
            },
            {
                xtype: 'displayfield',
                fieldLabel: me.snippets.api.status,
                name: 'status',
                bodyPadding: '3 0 0 0',
                listeners: {
                    render: function(c) {
                        var value;
                        if (me.configs.data.status == true) {
                            value = '<div class="sprite-tick"  style="width: 25px;display: inline-block;">&nbsp;</div>';
                        } else {
                            value = '<div class="sprite-cross" style="width: 25px;display: inline-block;">&nbsp;</div>';
                        }
                        if(me.configs.data.date != null){
                            value += me.snippets.api.tested_on + ' '+ Ext.Date.format(me.configs.data.date, 'd.m.Y h:i:s');
                        }
                        c.setValue(value);
                    }
                }
            }, {
                xtype: 'button',
                anchor: '25%',
                text: me.snippets.buttons.save_and_status,
                handler: function()
                {
                    me.fireEvent('saveAndCheck', me);
                }
            }]
        });

        me.settingsGrid = Ext.widget('swp_clever_reach-install-settings', {
            settingsStore: me.settingsStore
        });
        me.groupsForm = Ext.widget('swp_clever_reach-assignments', {
            assignmentsStore: me.assignmentsStore,
            groupsStore: me.groupsStore,
            formsStore: me.formsStore
        });
        return [me.apiFiledset, me.groupsForm, me.settingsGrid];
    }
});