var miscs = {
    roundToTwo(num) {
        if(num)    
            return +(Math.round(num + "e+2")  + "e-2");
        else 
            return num;
    },

    convertFormattedStrToBytes(fomattedStr) {
        let str = fomattedStr.trim()
        let value = 0
        switch(str.charAt(str.length-1)) {
            case 'K':
                value = 1024 * parseFloat(str.slice(0, -1))
                break
            case 'M':
                value = 1024 * 1024 * parseFloat(str.slice(0, -1))
                break
            case 'G':
                value = 1024 * 1024 * 1024 * parseFloat(str.slice(0, -1))
                break
            case 'T':
                value = 1024 * 1024 * 1024 * 1024 * parseFloat(str.slice(0, -1))
                break
            default:
                value = parseFloat(str)   
        }
        return value
    },
    // maximum memory
    maxMemSize() {
        return 380 *  1024 * 1024 * 1024 
    }
}
    


export default miscs