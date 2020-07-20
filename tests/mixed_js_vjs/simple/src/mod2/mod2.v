module mod2

fn mod() string {
	return '[module mod2]'
}

pub fn greet(msg string) {
	println('$mod() Greetings from V.js, $msg!')
}
