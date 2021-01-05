var series = {
    roundToTwo(num) {
        if(num)    
            return +(Math.round(num + "e+2")  + "e-2")
        else 
            return num
    },

    /**
     * format seriess values
     * @param {*} series values from server, or null to init
     */
    formatSeries(series){
        if (!series) {
            series = {}
        }
        //////// main tab
        // init channels if none
        if (!series['channels']) {
            try{
                let numOfChannels = parseInt(series['c']);
                let channels = []
                for(var i=1; i <=numOfChannels; i++){
                    var channelName = 'Channel ' + i;
                    channels.push({'name': channelName, 'iterations': 10,
                                    'wavelength': 525, 'pinhole': 0, 'background': 0})
                }
                series['channels'] = channels;
            }catch(err){
                // ignore
            }
        } 
        // name
        series['name'] = series['path']
        
        // swapZT
        if(series['z']==1 && series['t']>10){
            series['swapZT'] = true;
        } else {
            series['swapZT'] = false;
        }
        // output
        if(series['defaultoutput']){
            var _pathParts = series['defaultoutput'].split("/")
            series['outputBasePath'] = _pathParts.slice(0,-1).join("/")
            series['outputFolderName'] = _pathParts.slice(-1)[0]
        } else {
            series['outputBasePath'] = ""
            series['outputFolderName'] = ""
        }
        series['seperateOutputsBasedonInput'] = false
        
        series['generatePsf'] = false
        series['readSpacing'] = true
        series['psfModel'] = {label: 'Scalar', value: 0}
        series['RI'] = 1.33
        series['objectiveRIOption'] = 1.33
        series['ns'] = 1.33
        series['mediumRIOption'] = 1.33
        series['NA'] = 1.4
        series['lightSheetIlluminationNA'] = 0.5
        series['psfFile'] = ''
        series['psfInfo'] = {readSpacing: true}
        series['deskew'] = true
        series['keepDeskew'] = false
        series['angle'] = 32.8
        // series['median_threshold'] = series.roundToTwo(series['threshold'])
        series['deskewMetadata'] = [
            {   
                unit: series['unit'], 
                pixelWidth: series['pixelW'],
                pixelHeight: series['pixelH'], 
                voxelDepth: series['pixelD'] 
            }
        ]
        series['backgroundType'] = {'label': 'None', 'value': null}
        series['swapPsfZT'] = false
        series['saveEveryIterations'] = 0
        // format
        // series['dr'] = series.roundToTwo(series['dr'])
        // series['dz'] = series.roundToTwo(series['dz'])
        //
        series['psfType'] = 3
        
        /////////// NOISE
        series['regularizationType'] = {'label': 'None', 'value': 0}
        series['prefilter'] = 0
        series['postfilter'] = 0
        series['automaticRegularizationScale'] =  true
        series['regularization'] = -1
        //////////////ADVANCED
        series['blindDeconvolution']= false
        series['padding'] = {x: 0, y: 0, z: 0}
        series['tiling'] =  {x: 0, y: 0, z: 0}
        series['scaling'] =  {'label': 'Same as input', 'value': 1}
        series['fileformat'] = {'label': 'TIFF', 'value': 0}
        series['split'] =  {'label': 'No Split', 'value': 0}
        series['splitIdx'] = {'label': '0', 'value': 0}
        /////// DEVICES
        series['autoDetect']= false
        series['numberOfParallelJobs']= 1
        series['mem']= 100
        series['gpus'] = 1

        return series;
    }
}


export default series