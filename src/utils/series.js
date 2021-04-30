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
        if(!series['valid'])
            series['valid'] = false
        //////// main tab
        // init channels if none
        if (!series['channels'] || series['channels'].length === 0 ) {
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
        
        // fix unit
        if (series['unit'] === 'micron' ||  series['unit'] === 'microns')
            series['unit'] = 'µm'
        
            // default value if null
        if (!series['generatePsf'])
            series['generatePsf'] = false
        if (!series['readSpacing'])
            series['readSpacing'] = true
        if (!series['psfModel'])
            series['psfModel'] = 0
        if (!series['RI'])    
            series['RI'] = 1.515
        if (!series['objectiveRIOption']) 
            series['objectiveRIOption'] = 1.33
        if (!series['ns'])
            series['ns'] = 1.33
        if (!series['mediumRIOption'])
            series['mediumRIOption'] = 1.33
        if (!series['NA'])
            series['NA'] = 1.4
        if (!series['lightSheetIlluminationNA'])
            series['lightSheetIlluminationNA'] = 0.5
        if (!series['psfFile'])
            series['psfFile'] = ''
        if (!series['psfReadSpacing'])
            series['psfReadSpacing'] = true
        if (!series['deskew'])
            series['deskew'] = true
        if (!series['keepDeskew'])
            series['keepDeskew'] = false
        if (!series['angle'])
            series['angle'] = 32.8
        if (!series['threshold'])
            series['threshold'] = series['background']
        if (!series['backgroundType'])
            series['backgroundType'] = -1 // None
        if (!series['swapPsfZT'])
            series['swapPsfZT'] = false
        if (!series['saveEveryIterations'])
            series['saveEveryIterations'] = 0
            // format
            // series['dr'] = series.roundToTwo(series['dr'])
            // series['dz'] = series.roundToTwo(series['dz'])
            //
        if (!series['psfType'])
            series['psfType'] = 3
            
            /////////// NOISE
        if (!series['regularizationType'])
            series['regularizationType'] = 0
        if (!series['prefilter'])
            series['prefilter'] = 0
        if (!series['postfilter'])
            series['postfilter'] = 0
        if (!series['automaticRegularizationScale'])
            series['automaticRegularizationScale'] =  true
        if (!series['regularization'])
            series['regularization'] = -1
            //////////////ADVANCED
        if (!series['blindDeconvolution'])
            series['blindDeconvolution']= false
        if (!series['padding'])
            series['padding'] = {x: 0, y: 0, z: 0}
        if (!series['tiling'])
            series['tiling'] =  {x: 0, y: 0, z: 0}
        if (!series['scaling'])
            series['scaling'] =  1
        if (!series['fileformat'])
            series['fileformat'] = 0
        if (!series['split'])
            series['split'] =  0
        if (!series['splitIdx'])
            series['splitIdx'] = 0
            /////// DEVICES
        if (!series['autoDetect'])
            series['autoDetect']= false
        if (!series['instances'])
            series['instances']= 1
        if (!series['mem'])
            series['mem']= 100
        if (!series['gpus'])
            series['gpus'] = 1
        

        return series;
    },

    defaultDecon(){
        return {
                step: 1,
                visitedSteps: [],
                series: {},
                setting: series.formatSeries(null)
            }
    },

    /**
     * 
     * @param {*} series 
     * @param {*} psfFileSerie 
     */
    fixSeriesUnit(series){
        series.unit = series.unit.trim()
        series.dr = parseFloat(series.dr)
        if(!series.dr)
            delete series.dr
        series.dz = parseFloat(series.dz)
        if(!series.dz)
            delete series.dz
        series.pixelDepth = parseFloat(series.pixelDepth)
        if(!series.pixelDepth)
            delete series.pixelDepth
        series.pixelHeight = parseFloat(series.pixelHeight)
        if(!series.pixelHeight)
            delete series.pixelHeight
        series.pixelWidth = parseFloat(series.pixelWidth)
        if(!series.pixelWidth)
            delete series.pixelWidth
        series.background = parseFloat(series.background)
        if(!series.background)
            delete series.background
        
        if (series.unit === 'micron' ||  series['unit'] === 'microns')
            series.unit = 'µm'
        if (series.unit === '')
            delete series.unit
        return series
    },
    /**
     * apply values given in psfFileSerie to series
     * @param {*} series 
     * @param {*} psfFileSerie
     * return new series 
     */
    applyPsfToSeries(series, psfFileSerie){
        series['psfFile'] = psfFileSerie['path']
        series['psfDr'] = psfFileSerie['dr']
        series['psfDz'] = psfFileSerie['dz']
        series['psfReadSpacing'] = true
        series['psfX'] = psfFileSerie['x']
        series['psfY'] = psfFileSerie['y']
        series['psfZ'] = psfFileSerie['z']
        if(psfFileSerie['z']==1 && psfFileSerie['t']>10){
            psfFileSerie['swapZT'] = true
        } else {
            psfFileSerie['swapZT'] = false
        }
        series['swapPsfZT'] = psfFileSerie['swapZT']
        series['psfC'] = psfFileSerie['c']
        series['psfT'] = psfFileSerie['t']
        return series
    },
    /**
     * check whether the given series is valid
     * @param {*} series 
     */
    is_valid(series){
        console.log(series)
    }

}


export default series