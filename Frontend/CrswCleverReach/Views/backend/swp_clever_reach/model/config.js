Ext.define('Shopware.apps.SwpCleverReach.model.Config', {
    extend: 'Ext.data.Model',
    fields: [
            { name: 'api_key',  type: 'string' },
            { name: 'wsdl_url',  type: 'string' },
            { name: 'status',  type: 'boolean' },
            { name: 'date',  type: 'date' }

    ],
    proxy: {
        type: 'ajax',
        api: {
            read:    '{url action="getConfigs"}',
            update:    '{url action="saveConfigs"}'
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});