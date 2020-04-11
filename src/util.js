export function roundDecimal(value, decimals){
	let result = Math.round(value*Math.pow(10, decimals))/Math.pow(10, decimals);
	if(result === Infinity)
		result = 1;
	return result;
}