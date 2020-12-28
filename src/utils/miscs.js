var miscs = {
    roundToTwo(num) {
        if(num)    
            return +(Math.round(num + "e+2")  + "e-2");
        else 
            return num;
    }
}
    


export default miscs