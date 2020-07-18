module foo

pub fn hot() {
	#if (module.hot) module.hot.accept(() => true)
}
