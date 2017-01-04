<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
if(isset($_POST['submit'])){echo "<pre>"; print_r($_POST); }
echo 'hello';

$SENDGRID_API_KEY = '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'
// If you are using Composer
//require 'vendor/autoload.php';
/*
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $name = test_input($_POST["name"]);
  $email = test_input($_POST["email"]);
  $website = test_input($_POST["website"]);
  $comment = test_input($_POST["comment"]);
  $gender = test_input($_POST["gender"]);
}

function test_input($data) {
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}
*/




// If you are not using Composer (recommended)
require("./sendgrid-php/sendgrid-php.php");

$request_body = json_decode('{
  "personalizations": [
    {
      "to": [
        {
          "email": "nicholas.guest@gmail.com"
        }
      ],
      "subject": "Hello World from the SendGrid PHP Library!"
    }
  ],
  "from": {
    "email": "nicholas.guest@gmail.com"
  },
  "content": [
    {
      "type": "text/plain",
      "value": "Hello, Email!"
    }
  ]
}');

$apiKey = getenv('SENDGRID_API_KEY');
$sg = new \SendGrid($apiKey);

$response = $sg->client->mail()->send()->post($request_body);
echo $response->statusCode();
echo $response->body();
echo $response->headers();

?>
