#  What is IPP (Image processing portal)?

The IPP is a Web page for biologists to interact with High Performance Compute (HPC) systems at The University of Queensland.

The IPP is designed, funded and developed by the IMB Microscopy Facility & the Research Computing Centre (RCC)

# Why portal? 

The IPP makes using HPC resources possible by providing biologists with interactive tools in familiar and intuitive ways, by generating the required SLURM scripts and job submission documents automatically in the background without the need to know command-line! 

# Features


The IPP utilises the Wiener GPU-accelerated HPC system to make use of massively parallel image processing jobs. The portal is backed by the MeDiCI network infrastructure and can access image data-sets mounted on the Research Data Manager (RDM) GPFS based file system.

Currently the IPP has the following pipelines enabled:

* File Management: The ability to explore, copy/paste, and delete files interactively from within the browser, allowing files to be moved between collections, or organised on native HPC infrastructure, without having to bring the files locally to the users device.
* Converter: File conversion between the .ims (Imaris/Fusion) filetype and .tiff individual Z-stacks for accelerated ingest into Wiener. Coming soon .sld (Slidebook) will be implemented as a parallel processed for SButility (also developed by RCC).
PreProcessing: Batch processing and deskewing of Lattice Light-Sheet data-sets, as well as PSF distillation (bead centring & averaging).
* Deconvolution: Currently utilising Microvolution Deconvolution (with Light-Sheet, Widefield, Confocal and 2-Photon modalities supported) for either individual files or directories of files. This mode also supports Generating a PSF or suppling your own measured PSF files. Deconvolution is currently supported on up to 10 nodes simultaneously utilising up to 40 GPUs.
* Job List: Shows currently running jobs by the user by querying the SLURM queue


