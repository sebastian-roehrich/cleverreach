<?php
/**
 * CleverReach backend controller
 * - register product search
 * - first export
 * - subscribers groups and opt-in forms
 */
class Shopware_Controllers_Backend_SwpCleverReach extends Shopware_Controllers_Backend_ExtJs {
    /**
     * get all Shops from Shopware
     */
    public function getShopsAction() {
        $sql = "
            SELECT A.id,
                A.shop_name AS name,
                IFNULL(B.value, A.value) AS export_limit
            FROM (SELECT scs.id,
                        scs.name AS shop_name,
                        cs.name,
                        cs.type,
                        cs.value
                    FROM s_core_shops scs
                    CROSS JOIN (SELECT * FROM `swp_cleverreach_settings` WHERE shop = -1 AND name = 'export_limit') cs
                    ) AS A
            LEFT JOIN swp_cleverreach_settings AS B
                ON A.id = B.shop AND A.name = B.name AND A.type = B.type
            ORDER BY A.id, A.type DESC, A.name
            ";
        $rows = Shopware()->Db()->fetchAll($sql);
        
        $this->View()->assign(array('data'=>$rows, 'success'=>true));
    }
    /**
     * get all Subscribers Groups and their associatted Forms from CleverReach
     */
    public function getGroupsAction() {
        $config = $this->Plugin()->getConfig();
        $api = new SoapClient($config["wsdl_url"]);
        //get the Subscribers Groups from CleverReach
        $response = $api->groupGetList($config["api_key"]);
        $success = true;
        $message = "";

        if($response->status != "SUCCESS") {
            $success = false;
            $message = $response->statuscode . ": ". $response->message;
        }
        $select_option_groups = Shopware()->Snippets()->getNamespace('backend/swp_clever_reach/snippets')->get('assignments/groups/select_option', "auswählen");
        $select_option_forms = Shopware()->Snippets()->getNamespace('backend/swp_clever_reach/snippets')->get('assignments/forms/select_option', "kein Opt-In");
        $groups = array();
        $groups[] = array(
                "id" => -1,
                "name" => $select_option_groups,
                "forms" => array(
                        "id" => -1,
                        "name" => $select_option_forms
                )
        );
        foreach($response->data as $group) {
            $groups[] = array(
                    "id" => $group->id,
                    "name" => $group->name
            );
        }
        //get the Forms for each Subscribers Group from CleverReach
        foreach($groups as &$group) {
            $group["forms"] = array();
            $group["forms"][] = array(
                    "id" => -1,
                    "name" => $select_option_forms
            );
            $response = $api->formsGetList($config["api_key"], $group["id"]);
            if($response->status != "SUCCESS") {
                $success = false;
                $message = $response->statuscode . ": ". $response->message;
            }
            foreach($response->data as $form) {
                $group["forms"][] = array(
                        "id" => $form->id,
                        "name" => $form->name
                );
            }
        }

        $this->View()->assign(array('data'=>$groups, 'success'=>$success, 'message' => $message));
    }
    /**
     * get Configs api_key + wsdl_url
     */
    public function getConfigsAction() {
        $sql = "
            SELECT name,
                    value
            FROM swp_cleverreach_configs
            ";
        $rows = Shopware()->Db()->fetchAll($sql);

        $configs = array();
        foreach($rows as $row) {
            $configs[$row["name"]] = $row["value"];
        }

        $this->View()->assign(array('data'=>$configs, 'success'=>true));
    }
    /**
     * get Settings configurations for each shop
     */
    public function getSettingsAction() {
        $sql = "
            SELECT A.id AS shopId,
                A.shop_name,
                A.type,
                IFNULL(B.name, A.name) AS name,
                IFNULL(B.value, A.value) AS value,
                IF(B.shop IS NULL, false, true) as updated_value
            FROM (SELECT scs.id,
                        scs.name as shop_name,
                        cs.type,
                        cs.name,
                        cs.value
                    FROM s_core_shops scs
                    CROSS JOIN `swp_cleverreach_settings` cs
                    WHERE cs.shop = -1) AS A
            LEFT JOIN swp_cleverreach_settings AS B
                ON A.id = B.shop AND A.name = B.name AND A.type = B.type
            ORDER BY A.id, A.type DESC, A.name
            ";
        $rows = Shopware()->Db()->fetchAll($sql);

        $settings = array();
        $tmp = array();
        foreach($rows as $row) {
            if(!empty($tmp)) {
                if($tmp['shopId'] != $row['shopId']) {
                    $settings[] = $tmp;
                    $tmp = array();
                }
            }
            $tmp['shopId'] = $row['shopId'];
            $tmp['shop_name'] = $row['shop_name'];
            if($row['type'] == "install") {
                $tmp['updated_value'] = $row['updated_value'];
            }
            $tmp[$row["name"]] = $row["value"];
        }
        if(!empty($tmp)) {
            $settings[] = $tmp;
        }

        $this->View()->assign(array('data'=>$settings, 'success'=>true));
    }
    /**
     * call clientGetDetails in order to check if api_key is correct
     */
    public function checkAPIAction() {
        $success = false;
        $wsdl_url = $this->Request()->getParam("wsdl_url");
        $api_key = $this->Request()->getParam("api_key");
        if($wsdl_url && $api_key) {
            $api = new SoapClient($wsdl_url);
            $response = $api->clientGetDetails($api_key);

            $success = ($response->status == "SUCCESS");
            //update the status in db
            $params = array(
                "status" => ($success)? "true": "false",
                "date" => date("Y-m-d h:i:s")
            );
            $this->updateConfigs($params);
        }

        $this->View()->assign(array('success'=>$success));
    }
    /**
     * save api_key and wsdl_url
     */
    public function saveConfigsAction() {
        $params = array(
                "wsdl_url" => $this->Request()->getParam("wsdl_url"),
                "api_key" => $this->Request()->getParam("api_key")
        );
        $this->updateConfigs($params);
        
        $this->View()->assign(array('success'=>true));
    }
    /**
     * save limit_export, enable opt-in, extra info
     */
    public function saveSettingsAction() {
        $shopId = $this->Request()->getParam("shopId");
        $params = array(
                "export_limit" => $this->Request()->getParam("export_limit"),
                "newsletter_extra_info" => $this->Request()->getParam("newsletter_extra_info")
        );
        foreach($params as $name => $value) {
            $sql = "
                INSERT INTO swp_cleverreach_settings(shop, type, name, value) VALUES(?, 'install', ?, ?)
                ON DUPLICATE KEY UPDATE value=?;
                ";

            Shopware()->Db()->query($sql, array($shopId, $name, $value, $value));
        }

        $this->View()->assign(array('success'=>true));
    }
    /**
     * get all the Assignments from Shopware
     */
    public function getAssignmentsAction() {
        $sql = "
            SELECT scs.id AS shopId,
                   scs.name AS shop_name,
                   scs.active,
                   cg.id AS customergroup,
                   cg.description,
                   IFNULL(ca.listID, -1) AS listID,
                   IFNULL(ca.formID, -1) AS formID,
                   cg.groupkey
            FROM s_core_shops AS scs
            CROSS JOIN (
            	SELECT 0 AS id, 'Bestellkunden' AS description, 1 AS ordtype, '' AS groupkey
                UNION
                SELECT id, description, 2 AS ordtype, groupkey FROM s_core_customergroups
                UNION
                SELECT 100 AS id, 'Interessenten' AS description, 3 AS ordtype, '' AS groupkey
            ) AS cg
            LEFT JOIN swp_cleverreach_assignments ca ON cg.id = ca.customergroup
                        AND scs.id = ca.shop
            ORDER BY scs.name, cg.ordtype, cg.description
            ";
        $rows = Shopware()->Db()->fetchAll($sql);

        $this->View()->assign(array('data'=>$rows, 'success'=>true));
    }
    /**
     * save assignment with direct SQL statements to the database
     */
    public function saveAssignmentAction() {
        $shopId = $this->Request()->getParam("shopId");
        $customergroup = $this->Request()->getParam("customergroup");
        $listID = $this->Request()->getParam("listID");
        $formID = $this->Request()->getParam("formID");
        if($listID == -1) {
            $listID = "NULL";
        }
        if($formID == -1) {
            $formID = "NULL";
        }

        $sql = "
                INSERT INTO swp_cleverreach_assignments(shop, customergroup, listID, formID) VALUES(?, ?, $listID, $formID)
                ON DUPLICATE KEY UPDATE listID=$listID, formID = $formID;
                ";

        Shopware()->Db()->query($sql, array($shopId, $customergroup));
        //set this settings as checked
        $sql = "
                INSERT INTO swp_cleverreach_settings(shop, type, name, value) VALUES(?, 'check', 'groups', 'true')
                ON DUPLICATE KEY UPDATE value='true';
                ";

        Shopware()->Db()->query($sql, array($shopId));

        $this->View()->assign(array('success'=>true));
    }
    /**
     * save the "check" settings after first export or products search
     */
    public function setSettingsAsCheckedAction(){
        $shopId = $this->Request()->getParam("shopId");
        $name = $this->Request()->getParam("name");

        $sql = "
                INSERT INTO swp_cleverreach_settings(shop, type, name, value) VALUES(?, 'check', ?, 'true')
                ON DUPLICATE KEY UPDATE value='true';
                ";

        Shopware()->Db()->query($sql, array($shopId, $name));

        $this->View()->assign(array('success'=>true));
    }
    /**
     * update the configuration with a sql statement
     * @param <type> $params 
     */
    private function updateConfigs($params){
        foreach($params as $name => $value) {
            $sql = "
                UPDATE swp_cleverreach_configs
                SET value = ?
                WHERE name = ?
                ";

            Shopware()->Db()->query($sql, array($value, $name));
        }
    }
    /**
     * delete all the assignments and the settings
     */
    public function resetCleverReachAction(){
        $sqls[] = "
            TRUNCATE TABLE swp_cleverreach_assignments;
        ";
        $sqls[] = "
            DELETE FROM swp_cleverreach_settings WHERE shop <> -1;
        ";
        
        foreach($sqls as $sql)
            Shopware()->Db()->exec($sql);

        $this->View()->assign(array('success'=>true));
    }
    /**
     * Get an instance of the plugin
     * @return <type>
     */
    private function Plugin() {
        return Shopware()->Plugins()->Frontend()->CrswCleverReach();
    }
}
?>