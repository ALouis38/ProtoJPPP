<?php
require '../vendor/autoload.php';

$app = new \Slim\Slim();

$user = "protojpp";
$pass = "protojpp";
$db = new PDO('mysql:host=localhost;dbname=protojpp', $user, $pass);

$app->get('/hello/:name', function ($name) {
    echo "Hello, $name";
});

$app->post('/pathversions', function () use($app, $db) {

    
    $request = $app->request();
    $path = $request->getBody();
    
    $sql = "INSERT INTO pathversions (path, user, edit_date) VALUES (:path, :user, :edit_date)";
    
    try {
        $user = "Donovan";
        $date = "";
        $stmt = $db->prepare($sql);
        $stmt->bindParam("path", $path);
        $stmt->bindParam("user", $user);
        $stmt->bindParam("edit_date", $date);
        $stmt->execute();
        
        $lastId = $db->lastInsertId();

        $sql = "SELECT id, path FROM pathversions WHERE pathversions.id = :id"; 
        $stmt = $db->prepare($sql);
        $stmt->bindParam("id", $lastId);
        $stmt->execute();

        $result = $stmt->fetchObject();

        if ($result) { 
            $json = array();
            $json['path'] = json_decode($result->path, true);
            
            $history = $result->id;
            $json['history'] = $history;

            echo json_encode($json);
        }

        $db = null;

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }

    // TODO PETER LES BRANCHES PARALELLES

});

$app->post('/pathversions/undo/:id', function ($id = null) use($app, $db) { 
    // TODO WHERE USER = USER COURANT, etc...

    $sql = "SELECT id, json FROM pathversions ORDER BY id DESC LIMIT 1, 1";
    
    if ($id) {
        $sql = "SELECT id, json FROM pathversions WHERE pathversions.id < $id ORDER BY id DESC LIMIT 1";
    }
       
    //echo $sql;

    try {
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $db = null;

        $result = $stmt->fetchObject();

        if ($result) { 
            $json = json_decode($result->json);

            $history = array('history'=> $result->id);
    		$json[] = $history;

            echo json_encode($json);
        }
        // ELSE THROW ERROR

    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }

    //echo $body;
});

$app->post('/pathversions/redo', function () use($app, $db) {    
    $sql = "SELECT json FROM pathversions ORDER BY id DESC LIMIT 1, 1";
    // TODO WHERE USER = USER COURANT
    try {
        $stmt = $db->prepare($sql);
        $json = $stmt->execute();
        $db = null;
        // TODO echo json
        echo $sql;
    } catch(PDOException $e) {
        echo '{"error":{"text":'. $e->getMessage() .'}}';
    }

    //echo $body;
});

$app->run();
