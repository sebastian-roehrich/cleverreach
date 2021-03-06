//{namespace name=backend/swp_clever_reach/snippets}
Ext.define('Shopware.apps.SwpCleverReach.view.main.FirstExport', {
    extend: 'Ext.form.Panel',
    alias: 'widget.swp_clever_reach-first-export',
    autoScroll: true,
    cls: 'shopware-form',
    layout: 'anchor',
    border: false,
    defaults: {
        anchor: '100%',
        margin: 10
    },
    disabled: true,

    snippets: {
        title: '{s name="first_export_title"}Erst-Export{/s}',
        buttons: {
            text: '{s name="first_export/buttons/text"}Erst-Export starten{/s}'
        },
        export_limit : '{s name=install_settings/columns/export_limit}Export-Limit pro Step (max. 50){/s}',
        details_title: '{s name="first_export/details_title"}Details{/s}'
    },

    initComponent: function()
    {
        var me = this;
        me.title = me.snippets.title;
        me.items = me.getItems();

        me.callParent(arguments);
    },

    getItems: function()
    {
        var me = this;
        me.exportFiledset = Ext.create('Ext.form.FieldSet', {
            layout: 'anchor',
            region:'north',
            defaults: {
                anchor: '100%',
                labelWidth: '10%'
            }
        });
        me.shopsStore.each(function(record)
        {
            me.exportFiledset.add({
                xtype: 'fieldcontainer',
                fieldLabel: record.get('name'),
                layout: 'hbox',
                items: [{
                            xtype: 'button',
                            text: me.snippets.buttons.text,
                            shopId: record.get('id'),
                            margin: '0 10 0 0'
                        },{
                            xtype: 'numberfield',
                            name: 'export_limit',
                            fieldLabel: me.snippets.export_limit,
                            labelWidth: 180,
                            shopId: record.get('id'),
                            maxValue: 50,
                            minValue:0,
                            width:250,
                            listeners: {
                                render: function(c) {
                                    c.setValue(record.get('export_limit'));
                                }
                            }
                        }]
            });

        });

        return [
            me.exportFiledset,
            {
                xtype: 'panel',
                id: 'apiResults_export',
                name: 'apiResults',
                region:'center',
                title: me.snippets.details_title,
                html: '',
                border: true,
                bodyPadding: '1 1 1 1',
                bodyStyle: 'background: #D8E5EE;',
                height: 350
            }
        ];
    }
});