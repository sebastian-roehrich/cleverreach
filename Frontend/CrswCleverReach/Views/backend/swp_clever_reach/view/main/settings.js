//{namespace name=backend/swp_clever_reach/snippets}
Ext.define('Shopware.apps.SwpCleverReach.view.main.Settings', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.swp_clever_reach-install-settings',
    flex:2,
    collapsible: true,
    border: false,
    stripeRows:true,
    autoScroll:true,

    snippets: {
        title : '{s name="install_settings_title"}Einstellungen{/s}',
        columns: {
            shop_name : '{s name=install_settings/columns/shop_name}Shop{/s}',
            export_limit : '{s name=install_settings/columns/export_limit}Export-Limit pro Step (max. 50){/s}',
            newsletter_extra_info : '{s name=install_settings/columns/newsletter_extra_info}Info which will be sent to Opt-In postdata{/s}',
            updated_value : '{s name=install_settings/columns/updated_value}Updated{/s}',
            first_export : '{s name=install_settings/columns/first_export}Erst-Export{/s}',
            products_search : '{s name=install_settings/columns/products_search}Produkt-Such{/s}',
            groups : '{s name=install_settings/columns/groups}Shop/Kundengruppen-Listen-Zuordnung{/s}',
            activate_products_search: '{s name="install_settings/columns/activate_products_search"}Produkt-Suche aktivieren{/s}'
        }
    },

    initComponent: function() {
        var me = this;

        me.title = me.snippets.title;
        me.columns = me.getColumns();
        //me.editor = me.getRowEditorPlugin();
        //me.plugins = [ me.editor ];
        me.store = me.settingsStore;
        me.addEvents('onProductsSearch');
        me.callParent(arguments);
    },

    getColumns: function() {
        var me = this;
        return [{
            dataIndex: 'shop_name',
            text: me.snippets.columns.shop_name,
            flex: 2
        }/*,{
            dataIndex: 'export_limit',
            text: me.snippets.columns.export_limit,
            flex: 1,
            xtype: 'numbercolumn',
            format: '0',
            align: 'right',
            editor: {
                width: 85,
                xtype: 'numberfield',
                allowBlank: false,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                decimalPrecision: 0,
                maxValue: 50,
                fieldStyle: 'text-align: right;'
            }
        },{
            dataIndex: 'newsletter_extra_info',
            text: me.snippets.columns.newsletter_extra_info,
            flex: 3,
            editor: {
                xtype     : 'textfield'
            }
        },{
            dataIndex: 'updated_value',
            text: me.snippets.columns.updated_value,
            flex: 1,
            xtype: 'booleancolumn',
            renderer: me.renderBooleanColumn
        }*/,{
            dataIndex: 'first_export',
            text: me.snippets.columns.first_export,
            flex: 1,
            xtype: 'booleancolumn',
            renderer: me.renderBooleanColumn
        },{
            dataIndex: 'products_search',
            text: me.snippets.columns.products_search,
            flex: 1,
            xtype: 'booleancolumn',
            renderer: me.renderBooleanColumn
        },{
            dataIndex: 'groups',
            text: me.snippets.columns.groups,
            flex: 1,
            xtype: 'booleancolumn',
            renderer: me.renderBooleanColumn
        }, me.getActionColumn()
        ];
    },

    renderBooleanColumn: function(value, column, model) {
        var me = this;
        if (value) {
            return '<div style="width:100%;text-align:center;"><div class="sprite-tick"  style="width: 25px;display: inline-block;">&nbsp;</div></div>';
        } else {
            return '<div style="width:100%;text-align:center;"><div class="sprite-cross" style="width: 25px;display: inline-block;">&nbsp;</div></div>';
        }
    },

    /*getRowEditorPlugin: function() {
        return Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToEdit: 2,
            errorSummary: false,
            pluginId: 'rowEditing'
        });
    },*/

    getActionColumn: function() {
        var me = this,
	items = [];
        items.push({
                iconCls: 'sprite-table-export',
                tooltip: me.snippets.columns.activate_products_search,
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
                    me.fireEvent('onProductsSearch', record);
                }
            });
        return {
            xtype: 'actioncolumn',
            text: me.snippets.columns.activate_products_search,
            //width: 40,
            flex: 1,
            items: items
        };
    }
});