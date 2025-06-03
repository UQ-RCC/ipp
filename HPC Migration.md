## There are several things to consider when migrating from one HPC to another.

### Backend Updates
1. Update the `ipp-config` secrets.
- The new Keycloak migration requires several checks. 
    - Example: Following updates were made when migrating from https://auth.rcc.uq.edu.au to https://iam.rcc.uq.edu.au
    - Keycloak realm configs are updated to match those used by Open On Demand
    - New client IDs are assigned:
        * IPP - Updated from jsclient to bunyajsclient
        * IPP userinfo - Updated from userinfo-resource-server to bunya-userinfo-server
        * Resource server - Updated to bunya-resource-server

2. New resource server to submit SSH commands to HPC.
- If required, deploy a new resource server on rcc-portals-b prod cluster as per the [instructions](https://github.com/UQ-RCC/rcc-portals/blob/main/charts/resourceserver/README.md) 

4. Update SLURM commands in [resourceserver.json](https://github.com/UQ-RCC/ipp-scripts/blob/main/resourceserver_prod.json)
    - Save IPP scripts in separate folders for UAT and prod in the hpc file system 
    E.g. For Bunya- prod scripts are in /sw/local/ipp/portal-data/scripts-bunya-prod/
    - Login node restrictions and conversion of ssh commands to run on compute node. Please refer to the [user guide](https://github.com/UQ-RCC/hpc-docs/blob/main/guides/Bunya-User-Guide.md#interactive-jobs) for Bunya restrictions. 
    - Slurm command updates with necessary parameters (e.g. partition, qos, walltime). See [slurm scripts](https://github.com/UQ-RCC/hpc-docs/blob/main/guides/Bunya-User-Guide.md#slurm-scripts) for examples.
        - Example
         ```  
         sbatch --array=0-{arrayMax} --mem={mem}G --partition={partition} --qos={qos} --time={walltime} --gres=gpu:l40:{devices} -N1 -n1 -c4 -L {licence} -J ipp_decon -o {output} 
         ```

    - Update `-L ` param with new microvolution licence 
    - Access to a debug QoS for quick testing of new jobs e.g. `-p gpu_cuda --qos=debug`
    - Scratch folder path updates. For Bunaya `/scratch/user/<username>`

5. Update IPP-scripts in HPC file system. 
    - E.g. adjust paths from Wiener afm to Bunya QRISdata
6. Github IPP-Repo repository access for Macros and metadata
    - Update `ipp-config` to include `git user` for cloning a local copy of IPP-repo repository to support macros and metadata.

7. Dedicated desktop for IPP users on Open On Demand
    -   .ippaction file and .ippaction_run files to open apps when launching IPP desktop 


## IPP Portal Updates 

1. Home Page : HPC quota limit display
2. File Manager : 
    -   File system difference e.g. afm vs QRISdata
    -   Changes in `Display in virtual desktop` : 
        - select files -> open application -> launch desktop, 
        - If an IPP desktop is already running, the app will open on the existing desktop—no need to launch a new one
3. Desktop Manager : 
    - IPP desktop is auto selected. 
    -  Redirect to OOD page to configure resources and launch the desktop
