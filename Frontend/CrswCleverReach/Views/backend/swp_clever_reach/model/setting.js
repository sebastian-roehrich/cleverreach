Ext.define('Shopware.apps.SwpCleverReach.model.Setting', {
    extend: 'Ext.data.Model',
    fields: [
            { name: 'shopId',  type: 'int' },
            { name: 'shop_name',  type: 'string' },
            { name: 'export_limit',  type: 'int' },
            { name: 'newsletter_extra_info',  type: 'string' },
            { name: 'updated_value',  type: 'boolean' },
            { name: 'first_export',  type: 'boolean' },
            { name: 'products_search',  type: 'boolean' },
            { name: 'groups',  type: 'boolean' }
    ],
    proxy: {
        type: 'ajax',
        api: {
            read:    '{url action="getSettings"}',
            update:    '{url action="saveSettings"}'
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});