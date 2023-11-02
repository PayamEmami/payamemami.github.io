---
layout: page
permalink: /tools/
title: tools
description: Some of the public tools i have developed
nav: true
nav_order: 5
---

# MetaboIGNITER

[Metaboigniter](https://nf-co.re/metaboigniter) is bioinformatics pipeline for pre-processing of mass spectrometry-based metabolomics data. The workflow performs MS1 based quantification and MS2 based identification using combination of different modules.

This pipeline ingests raw mass spectrometry data in mzML format, typically in the form of peak lists and MS2 spectral data, for comprehensive metabolomics analysis. The key stages involve centroiding, feature detection, adduct detection, alignment, and linking, which progressively refine and align the data. The pipeline can also perform requantification to compensate for missing values and leverages MS2Query for compound identification based on MS2 data, outputting a comprehensive list of detected and potentially identified metabolites.

# Metabolinden

[Metabolinden](https://github.com/PayamEmami/nf-core-metabolinden) is bioinformatics pipeline for pre-processing of mass spectrometry-based metabolomics data. It differs from MetaboIGNITER in a way that it allows users to iteratively run a set of parameters to select the most stable one based on internal standards and repeated injection of the same sample.

# MetaboRAID

[MetaboRAID](https://github.com/metaboraid/metaboraid) is an R package enabling rapid metabolite identification using mass spectrometry MS1 and MS2 data. MetaboRAID includes functions for estimating adducts, neutral masses, and merging of spectra.

# mirnatargetdetector

[mirnatargetdetector](https://github.com/PayamEmami/mirnatargetdetector) is Nextflow-based pipeline that uses Miranda and RNAHybrid to detect miRNA targets.

# Mixedcirc

[Mixedcirc](https://github.com/PayamEmami/mixedcirc) uses mixed models to perform differential circadian rhythm analysis. It includes options to perform circadian rhythm on various types of data including RNA-seq, RRBS methylation, metabolomics, proteomics etc. Various signal processing and statistical analysis of circadian rhythm detection are supported out of the box.

# proteomics-rke

[proteomics-rke](https://github.com/PayamEmami/proteomics-rke) is a cloud-based infrastructure that provides a simple way of deploying a k8s cluster to run Nextflow-based workflows.

# r-kubernetes

[r-kubernetes](https://github.com/PayamEmami/r-kubernetes) is a simple wrapper that can be used to offload R sessions to Kubernetes. 

# integrative_overrepresentation

[integrative_overrepresentation](https://github.com/PayamEmami/integrative_overrepresentation) used p-value fusion to perform pathway-level data integration for a number of modalities where KEGG pathway exists.

# distance_matrix

[distance_matrix](https://github.com/PayamEmami/distance_matrix) is a collection of methods to calculate dissimilarity matrix on a large dataset. It can run on multiple cores and has managame memory footprint.