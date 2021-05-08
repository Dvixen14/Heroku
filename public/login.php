<?php

include 'config.php';

session_start();

error_reporting(0);

if (isset($_SESSION['username'])) {
	header("Location: welcome.php");
}

if (isset($_POST['submit'])) {
	$email = $_POST['email'];
	$password = md5($_POST['password']);

	$sql = "SELECT * FROM users WHERE email='$email' AND password='$password'";
	$result = mysqli_query($conn, $sql);
	if ($result->num_rows > 0) {
		$row = mysqli_fetch_assoc($result);
		$_SESSION['username'] = $row['username'];
		header("Location: welcome.php");
	} else {
		echo "<script>alert('Woops! Email or Password is Wrong.')</script>";
	}
}

?>

<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

	<link rel="stylesheet" type="text/css" href="stylelogin.css">

	<script src="https://code.jquery.com/jquery-3.6.0.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js"></script>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css">

	<title>Login MongoDBChat</title>
</head>

<body>
	<header>
		<nav class="navbar navbar-expand-lg navbar-dark">
			<a id="logo" class="navbar-brand mt-auto mb-auto" href="#">
				<img src="logo.png" width="50" height="50" class="d-inline-block align-top" alt="">
				MongoDBChat
			</a>

			<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
				&#9776;
			</button>

			<div class="collapse navbar-collapse navbar-toggleable-xs" id="navbarNav">
				<ul class="navbar-nav mr-auto">
					<li class="nav-item">
						<a class="nav-link" href="#">Home</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="index.html">Chat</a>
					</li>
				</ul>

				<form class="form-inline navbar-form float-right" method="get" action="login.php">
					<button class="btn btn-outline-success ml-auto" type="submit">Login</button>
				</form>
			</div>
		</nav>
	</header>
	<div class="container">
		<form action="" method="POST" class="login-email">
			<p class="login-text" style="font-size: 2rem; font-weight: 600;">Login</p>
			<div class="input-group">
				<input type="email" placeholder="Email" name="email" value="<?php echo $email; ?>" required>
			</div>
			<div class="input-group">
				<input type="password" placeholder="Password" name="password" value="<?php echo $_POST['password']; ?>" required>
			</div>
			<div class="input-group">
				<button name="submit" class="btn">Login</button>
			</div>
			<p class="login-register-text">Don't have an account? <a href="register.php">Register Here</a>.</p>
		</form>
	</div>
</body>

</html>