let intlTime = new Intl.DateTimeFormat("zh-CN",{
	hour:"2-digit",
	minute:"2-digit",
	second:"2-digit",
})
export function getTime() {
	return intlTime.format(Date.now())
}
