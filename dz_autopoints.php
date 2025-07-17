<?php
/**
* Plugin Name: dz_autopoints
* Description: Añade boton que aumenta los puntos al plugin de gamingpress
* Version: 1.3
* Author: Fradniev Gonzalez
**/
if ( ! class_exists( 'dz_autopoints' ) ) {
    class dz_autopoints {
        function __construct() {
            add_action('admin_footer', [ $this, 'admin_scripts' ],99, 2 ,true);
            add_action( 'wp_ajax_dz_autopoints_profile_update_user_points', [ $this, 'dz_autopoints_ajax_profile_update_user_points'] ,"", "" ,true);
            add_action( 'wp_ajax_nopriv_dz_autopoints_profile_update_user_points', [ $this, 'dz_autopoints_ajax_profile_update_user_points'] ,"", "" ,true );
            add_action( 'wp_ajax_dz_autopoints_disable', [ $this, 'dz_autopoints_ajax_disable'] ,"", "" ,true);
            add_action( 'wp_ajax_nopriv_dz_autopoints_disable', [ $this, 'dz_autopoints_ajax_disable'] ,"", "" ,true );
            add_action( 'wp_ajax_dz_autopoints_check', [ $this, 'dz_autopoints_check'] ,99, 2 ,true);
            add_action( 'wp_ajax_nopriv_dz_autopoints_check', [ $this, 'dz_autopoints_check'] ,99, 2 ,true );
            add_action( 'add_meta_boxes', [ $this, 'dz_autopoints_meta_box_add'] ,99, 2 ,true);
            add_action( 'plugins_loaded', [ $this, 'dz_autopoints_remove_plugin_filter'],99,1,true );
        }
        function dz_autopoints_remove_plugin_filter() {
            remove_filter( 'next_post_link', 'gamipress_hide_next_previous_hidden_achievement_link', 10 );
            remove_filter( 'previous_post_link', 'gamipress_hide_next_previous_hidden_achievement_link', 10 );
        }
        /*Adds a button that increase the points*/
        public function dz_autopoints_meta_box_add()
        {
            add_meta_box( 'dz_autopoints_button', 'Button disabled', 'dz_autopoints_meta_box_button', 'side', 'high' );
        }
        function dz_autopoints_meta_box_button( $post )
        {  
            if ( (isset($_GET['page']) && isset($_GET['route']) && 'fluent_forms' == $_GET['page'] && 'entries' == $_GET['route']) ){
                $button_disabled = get_post_meta( $_GET['form_id'], 'dz_autopoints_button', true );
                var_dump($button_disabled);
                echo '<button id="add_point" class="el-button el-button--primary el-button--small" type="button" style="margin-top:20px;">Añadir Puntos</button>';  
            }   
        }
        /*Check if the button should be enabled or disabled*/
        function dz_autopoints_check() {
            $formApi = fluentFormApi('forms')->entryInstance($formId = $_POST['form_id']);
            $entry = $formApi->entry($entryId = $_POST["entry_id"], $includeFormats = false);
            $metaid = $_POST['form_id']."".$entry["submission"]["id"];
            $buttonmeta = get_metadata("post", $metaid, 'disabled',true);
            if ($buttonmeta != "" && in_array($metaid, $buttonmeta)) {
                wp_send_json_success( "disabled" );
            } else {
                wp_send_json_success( "enabled" );
            }
        }
        /*Disables the button when pressed. The button should be pressed only once*/
        function dz_autopoints_ajax_disable() {
            $formApi = fluentFormApi('forms')->entryInstance($formId = $_POST['form_id']);
            $entry = $formApi->entry($entryId = $_POST["entry_id"], $includeFormats = false);
            $metaid = $_POST['form_id']."".$entry["submission"]["id"];
            $buttonarray = get_metadata("post", $metaid, 'disabled',true);
            if($buttonarray){
                array_push($buttonarray, $metaid);
                $buttonmeta = update_metadata("post", $metaid,'disabled',$buttonarray);
            }else{
                $buttonmeta = update_metadata("post", $metaid,'disabled',[$metaid]);
            }
            wp_send_json_success( $buttonmeta );
        }
        public function admin_scripts() {
            $formApi = fluentFormApi('forms')->entryInstance($formId = $_GET['form_id']);
            $entry = $formApi->entry($entryId = 2, $includeFormats = false);
            $users_data = get_users();
            $users = [];
            foreach ($users_data as $key => $user) {
                $simple_user = new stdClass;
                $simple_user->ID = $user->data->ID;
                $simple_user->user_login = $user->data->user_login;
                $simple_user->user_email = $user->data->user_email;
                $simple_user->display_name = $user->data->display_name;
                $users[] = $simple_user;
            }
            if ( (isset($_GET['page']) && isset($_GET['route']) && 'fluent_forms' == $_GET['page'] && 'entries' == $_GET['route']) ){
                wp_enqueue_script( 'button_js', plugins_url( '/admin/js/button.js', __FILE__ ));
                wp_localize_script('button_js', 'dz_autopoints', array( 
                    'siteurl'   => get_option('siteurl'), 
                    'nonce'     => gamipress_get_nonce(),
                    'ajaxurl'   => esc_url( admin_url( 'admin-ajax.php', 'relative' ) ),
                    'users'   => $users,
                    'form_id'   => $_GET['form_id'],
                ));
                wp_register_style( 'button_css', plugins_url( '/admin/css/button.css', __FILE__ ));
                wp_enqueue_style('button_css');
            }
        }

        function get_all_users(){
            $name_array = preg_split("/[\s,]+/", $search_name);
            $users = new WP_User_Query(array(
                'meta_query' => array(
                    'relation' => 'AND',
                    array(
                        'key' => 'first_name',
                        'value' => $name_array[0],
                        'compare' => 'LIKE'
                    ),
                    array(
                        'key' => 'last_name',
                        'value' => $name_array[1],
                        'compare' => 'LIKE'
                    )
                )
            ));
            $users_found = $users->get_results();
        }
        function dz_autopoints_ajax_profile_update_user_points() {
            // Security check, forces to die if not security passed

            $points             = (int)$_POST['points'];
            $register_movement  = ( bool ) $_POST['register_movement'];
            $earnings_text      = sanitize_text_field( $_POST['earnings_text'] );
            $points_type        = sanitize_text_field( $_POST['points_type'] );
            $user_id            = absint( $_POST['user_id'] );

            // Check if user can edit other users
            if ( ! current_user_can( 'edit_user', $user_id ) ) {
                wp_send_json_error( __( 'You can perform this action.', 'gamipress' ) );
            }

            // Check if user can manage GamiPress
            if( ! current_user_can( gamipress_get_manager_capability() ) ) {
                wp_send_json_error( __( 'You can perform this action.', 'gamipress' ) );
            }

            // Check if valid user ID
            if( $user_id === 0 ) {
                wp_send_json_error( __( 'Invalid user ID.', 'gamipress' ) );
            }

            // Check if valid amount
            if( ! is_numeric( $points ) ) {
                wp_send_json_error( __( 'Invalid points amount.', 'gamipress' ) );
            }

            // Check if is valid points type
            if( $points_type !== '' && ! in_array( $points_type, gamipress_get_points_types_slugs() ) ) {
                wp_send_json_error( __( 'Invalid points type.', 'gamipress' ) );
            }

            // Grab the user's current points
            $current_points = gamipress_get_user_points( $user_id, $points_type );
            $current_points += $points;
            // Update the user points
            gamipress_update_user_points( $user_id, $current_points, get_current_user_id(), null, $points_type );
            if( $register_movement ) {

                // Insert the custom user earning for the manual balance adjustment
                gamipress_insert_user_earning( $user_id, array(
                    'title'         => $earnings_text,
                    'user_id'       => $user_id,
                    'post_id'       => gamipress_get_points_type_id( $points_type ),
                    'post_type'     => 'points-type',
                    'points'        => $points,
                    'points_type'   => $points_type,
                    'date'          => date( 'Y-m-d H:i:s', current_time( 'timestamp' ) ),
                ) );

            }

            // After update the user points balance, is possible that user unlocks a rank
            // For that, we need to return the current user ranks again and check for differences
            $ranks = array();

            foreach( gamipress_get_rank_types_slugs() as $rank_type ) {

                // Get the rank object to build the same response as gamipress_ajax_profile_update_user_rank() function
                $rank = gamipress_get_user_rank( $user_id, $rank_type );

                $ranks[] = array(
                    'ID' => $rank->ID,
                    'post_title' => $rank->post_title,
                    'post_type' => $rank->post_type, // Included to meet the rank type
                    'thumbnail' => gamipress_get_rank_post_thumbnail( $rank->ID, array( 32, 32 ) ),
                );
            }

            wp_send_json_success( array(
                'message' => __( 'Points updated successfully.', 'gamipress' ),
                'points' => gamipress_format_amount( $points, $points_type ),
                'ranks' => $ranks
            ) );

        }
    }
    $autopoints = new dz_autopoints();
}