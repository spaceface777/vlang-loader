module foo

fn mod() string {
	return '[module mod1]'
}

pub fn greet(msg string) {
	println('$mod() Greetings from V.js, $msg!')
}
