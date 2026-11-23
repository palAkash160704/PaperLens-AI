## ARGUS: Context-Aware Multimodal Behavioral Intelligence System for Real-Time Safety Monitoring

Preetam Naresh Lagishetty Department of CSE(AIML) Ramaiah Institute of Technology Bangalore, India 1ms23ci093@msrit.edu Akash Pal Department of CSE(AIML) Ramaiah Institute of Technology Bangalore, India 1ms23ci009@msrit.edu Anurag Department of CSE(AI&amp;ML) Ramaiah Institute of Technology Bangalore, India 1ms23ci146@msrit.edu

Adityaraj Mandloi Department of CSE(AI&amp;ML) Ramaiah Institute of Technology Bangalore, India

1ms23ci005@msrit.edu

Abstract-This abstract describes the fundamental shift currently happening within the domain of urban surveillance systems. From a passive forensic approach consisting of analyzing visual data after an event (and therefore conducting post-event analysis) to implementing real-time intelligence solutions that allow action to be taken during an incident, urban surveillance methods today depend heavily on manually monitoring vast amounts of visual information. This is a labor-intensive process which often results in slow response times and a greater risk for human error when trying to assess the information being received.

To address these issues, the authors are providing and introducing a new framework called "ARGUS", a context-aware multimodal intelligence platform capable of delivering actionable insights for safe monitoring. The system combines three highly optimized and innovative components: intelligent visual detection using YOLOv8 for human and weapon identification; sound location through combining convolutional neural networks (CNNs) with a transformer for accurately locating screams; and an audio processing system for detecting angry voices.

All of these different modalities are combined using spatiotemporal context modeling and the dynamic risk weighting method to convert raw sensor data into usable information. Through experimentation, the authors can demonstrate that using multimodal validation will provide a significant increase in reliability and a dramatic reduction of false positives in low signal-to-noise areas.

Index Terms-Multimodal AI, Edge Computing, Intelligent Surveillance, YOLOv8, Scream Detection, Physical AI, Safe Route Recommendation, Risk Assessment.

## I. INTRODUCTION

The fast growth of smart cities infrastructure has given rise to. to the extensive use of surveillance systems throughout both in the public and private settings, producing volumes of volumes. of continuous visual information. Most of the existing grew, in spite of this growth. systems are essentially reactive, based upon post-event. instead of facilitating realtime intervention, forensic analysis. Human operators, who have a role in monitoring several video. significantly, streams, face cognitive overload and fatigue. making it more likely to miss temporary but important. safety events. The fact that this is a limitation highlights the importance of smart, automated systems that can detect threats proactively. and immediate response.

The latest developments in deep learning, especially in realtime. object detectors like YOLOv8, have allowed. effective identification of the individuals and threats. within video streams. But even the purely visual methods are not adequate to full comprehension of behavior, because they cannot record the dynamics of time and frequently misinterpret the harmless actions as suspicious. Moreover, traditional surveillance systems do not pay much attention to auditory signals, including. screams or distress signs, often an early one. indicators of danger. Lack of multimodal reasoning. reduces the level of reliability and awareness of context needed. robust real-world deployment.

To overcome these issues, this project introduces ARGUS, a. context-based multimodal behavioral intelligence system that can be used in edge-native, real-time safety surveillance. The framework combines visual detection, acoustic anomaly analysis, and spatiotemporal context modeling to build a whole picture of human behavior. A combination of these modalities will result in. ARGUS enables through a weighted risk scoring mechanism. precise event validation with minimum false positives. This movement of single-point intelligence to contextual intelligence. represents an essential step to creating responsive, efficient, and scalable surveillance systems nextgeneration smart. environments.

## II. LITERATURE REVIEW

The shift to active safety regimes is based on. heavy on improvements in various areas of artificial. intelligence which encompasses visual detection, acoustic analysis and so on. data fusion. The section is a synthesis of recent studies that constitute. the technological basis of modern, autonomous safety. analytics.

## A. A. Lightweight Visual Analytics and Edge Detection

Maximizing the visual recognition of resource-limited edge. One of the main priorities of current surveillance literature is devices.

- Wang et al. [1] created a lightweight YOLOv8n-based. person detector which adds an MSBlock to extract multiscale features and uses AKConv to reduce. computational parameters. It is an architecture that is specifically created to enhance inference speed and accuracy. for real-time surveillance.
- Particular to the physical threats, Farhan et al. [8] used a. YOLOv8m network to detect hidden weapons.

The initial study by Redmon et al. [11] and The foundation of Bochkovskiy et al. [12] was laid. single-pass, real-time object detection with the YOLO. family, which makes edgebased surveillance a possibility.

To retain identity persistence to understand behavior, such algorithms as DeepSORT [13] use Kalman. filtering and deep association measures to trace many. objects through occlusions.

- Additional optimization to edge deployment, new literature. benchmarked YOLO26, a model, which eliminates Distribution Focal Loss (DFL) to simplify the regression head. and uses a MuSGD optimizer to speed up processing.

Pervasive visual privacy To overcome the privacy issues of the pervasive visual. monitoring, frameworks such as VisShield thwart Personally. PII leakage with targeted. OCR masking.

## B. B. Abnormal Behavior and Recognition of Anomalies

The diagnosis of abnormality of human behavior depends. with a heavy emphasis on spatiotemporal analysis.

Sundaram et al. [6] used deep learning models to differentiate between normal and anomalous patterns of human activity. in surveillance videos.

A pipeline proposed by S. S and J. G. J [7] had the following properties. is a real-time human localization system that uses YOLO. and with Conv2D neural networks to classify activities. to normal and abnormal.

To learn semantic meaning of motion, Two-Stream To process, convolutional Networks [14] and spatiotemporal multiplier networks [15] have been suggested. modeling long-term separately spatial and temporal cues. dependencies.

- Extending behavior recognition to transit settings, deep learning models have been applied to identify. unsafe driving habits by classifying unsafe positions. and distractions to enhance traffic safety.

## C. C. Acoustic Threat and Emotion Detection

With the drawbacks of systems that are based on visual only, like blind. spots and occlusions, audio analytics offers important earlywarning features.

Zhu-Zhou et al. [2] developed an energy-efficient system specifically aimed at anger detection in noisy. surveillance environments. By putting the task in terms of a. their binary classification and spectral features extraction. neural network performed well in heavy. acoustic interference.

- Kim et al. [3] proposed a CNNTransformer hybrid model to process Mel-spectrograms in order to detect acute distress. of screams. The addition of a Windowing CNN facilitated. exact temporal interval forecasting in a variety of noise. conditions.

Environmental audio classification has come of age by way of. the presence of a wide range of datasets such as ESC-50 [16]. and UrbanSound8K [17], that enable deep learning methods [18] to effectively classify ambient city noises.

## D. D. Multimodal Fusion Architectures

Fusion of visual and acoustic modalities greatly decrease the false-positive rates of unimodal. systems.

Pang et al. [4] showed that fusing visual features. video frames containing audio features give a more. strong discriminative power of violent and non-violent scenes. than purely visual cues.

Violence-MFAS framework [10] introduces an architecture search method, which is automated to achieve this integration. learns the best multimodal fusion networks to learn audiovisual spatial-temporal interactions.

IDGViolenceNet [9] is a mixture of identity-aware dynamic to capture complex human interactions. 3D-CNNs on spatiotemporal graphs to conflict. in complex scenes.

The Lestari et al. [5] used in the case of localized proactive defense. IMT data to verify security threats in real time, greatly reducing the number of false alarms.

Other advanced models such as the Adaptive Multimodal. Temporal Fusion Network (AMTF-Net) refine realtime action recognition through dynamically assigning fusion. to RGB, audio and optical flow streams. on contextual needs.

Practically, to make these complex fusion pipelines work with edge hardware, researchers often use lightweight knowledge. compress Transformer models using distillation to compress heavy models. efficient architectures.

## E. E. Routing and Emergency Communications

To translate the threats identified into actionable safety, it takes. strong communication and spatial direction.

- Emergency communicative structures have been made realtime. has been successfully developed with MERN stack. WebSockets to enable bidirectional communication with a low latency[18].
- Comparisons of communication protocols. verify that although WebRTC is outright better in peer-to-peer media,

WebSockets can be very reliable, scalable architecture optimal to safety dashboard messaging[20].

Crime-conscious safe route recommendation systems have been designed to be used in regard to spatial safety. adding APIs and crime data to guide pedestrians. out of historic hot spots.

- Crime is dynamically incorporated into advanced routing models. score severity into their sense by balancing the edge. pathfinding algorithm (such as AAST) weights. ) to minimize traveler crime exposure[19].

## F. F. Physical AI and Hazard Detection

Extending surveillance capabilities, systems integrating Physical AI: Physical AI offer end-to-end environmental disastermanagement intelligence at the edge[20]. Functioning as localized nodes, they are able to study seismic P-wave and. S-wave information to ascertain earthquake epicenters and trigger. autonomous IoT interventions (like gas shut-offs) before destructive wave arrival[15]. Furthermore, embedding physical sensing logic is used to remove the false positives typical of. autonomous fire detection (visual only).

## III. RESEARCH METHODOLOGY

This segment describes the ARGUS system, which is a contextual and multimodal behavioral intelligence system used for safety surveillance in urban areas. The primary concept of ARGUS is that reliable threat detection cannot be based on one sense input only but can be achieved through integration of visual and auditory sensing capabilities. This is accomplished by the integrated framework that ARGUS uses to collect sensory inputs, analyze temporal changes, and generate readable threat assessment outputs.

## A. System Architecture

## ARGUS v5: Triple-Engine System Architecture for Real-Time Behavior Detection

<!-- image -->

NotebookLM

Fig. 1: ARGUS Multimodal System Architecture Pipeline.

The ARGUS system is created to be a modular, edge-native architecture with capability to process data in real-time with low latency. The architecture consists of three major subsystems (i) visual intelligence, (ii) acoustic intelligence and (iii) multimodal fusion and contextual reasoning. The subsystems work together and independently to provide robustness and scalability.

The raw video and audio streams are first obtained on surveillance infrastructure. The streams are handled with parallel pipelines to eliminate bottlenecks and provide low-latency inference. The visual subsystem and the audio subsystem identify the features of space and motion respectively and the temporal acoustics respectively. The subsystems generate intermediate representations of possible anomalies.

Temporal coherence is achieved by aligning the outputs of both pipelines with the help of windowing on timestamps. This is an important step to synchronize events taking place in different modalities but in the same time frame. The synchronized data is then forwarded to a spatiotemporal context modeling module that summarizes various low-level detections into high-level event clusters. This eliminates duplicate alerts and enhances interpretability.

Lastly, there is a weighted risk scoring system that determines the seriousness of the identified events based on the combination of the evidence of both modalities.

## B. Visual Processing and Behavioral Analysis

The responsibility of the visual processing pipeline is to detect entities and track their behavior over time. The video feed is captured at a rate of 5 frames per second, which provides sufficient temporal resolution for behavior analysis while keeping the computational burden manageable.

For every image, the YOLOv8n object detector is employed due to its optimal trade-off between precision and low complexity. The YOLOv8 family of detectors implements one-stage object detection algorithms and provides real-time detection of humans and weapons.

In order to analyze the behavior of the detected entities, ARGUS employs DeepSORT object tracking. DeepSORT algorithm relies on combining motion prediction using Kalman filters and deep learning-based feature embedding to achieve robust data association. This allows consistent identification of each person despite short occlusions and fast movement.

Finally, kinematic analysis is used to derive the behavior of entities. The velocity and acceleration of each tracked person are calculated as:

$$v = \frac { \Delta x } { \Delta t } , \ \ a = \frac { \Delta v } { \Delta t }$$

where x represents spatial position and t denotes time. These quantities capture motion dynamics, enabling the detection of sudden or abnormal movements.

In addition, interpersonal interactions are quantified using Euclidean distance:

$$d = \sqrt { ( x _ { 2 } - x _ { 1 } ) ^ { 2 } + ( y _ { 2 } - y _ { 1 } ) ^ { 2 } }$$

This metric is essential for identifying proximity-based interactions. For example, aggressive behavior is inferred when two individuals exhibit rapidly decreasing distance combined with high relative velocity. This combination provides a stronger indicator of conflict than either feature alone.

## C. Audio Processing and Statistical Anomaly Detection

The audio stream enhances our observations from the visual stream by picking up instances of events which may not be readily observable, such as screaming or sudden crashes. To ensure consistency and to reduce computational loads, the audio signal is downsampled to 16 kHz and converted to mono.

A series of short samples are extracted using a sliding window technique. For each sample, two acoustic features are extracted - the Root Mean Squared (RMS) and the spectral centroid. The RMS indicates the loudness of the audio signal, while the spectral centroid represents the position of the frequency spectrum of the audio.

To detect anomalies, the ARGUS system utilizes a statistical approach based on Z-score normalization:

$$Z = \frac { E - \mu } { \sigma }$$

where E is the observed energy, µ is the mean baseline energy, and σ is the standard deviation [19]. This formulation measures how far a given observation deviates from normal environmental conditions.

A high Z score indicates significant deviation, highlighting the possibility of abnormal behavior such as screaming, banging, or yelling. The advantage of this technique lies in its flexibility because it adjusts according to changing environmental sounds.

## D. Multimodal Fusion and Context Modeling

One of the critical achievements in ARGUS is multimodal fusion, wherein both audio and visual information are combined into a unified decision process. Both audio and visual signals are synchronized temporally using a time stamp-based windowing mechanism to compare related events.

The synchronized streams are then processed through a spatiotemporal context modeling stage where related detections are grouped into events. This procedure is critical in reducing redundancies by combining different detection events into a single event.

To quantify the severity of events, a weighted risk scoring function is defined:

$$R = w _ { v } \cdot S _ { v } + w _ { a } \cdot S _ { a } & & ( 4 ) & \bullet \text { Tr}$$

where Sv and Sa represent visual and audio anomaly scores, and wv, wa are modality-specific weights. This formulation allows flexible weighting based on environmental conditions or system priorities.

A substantial increase in the risk factor is seen when both modalities detect an anomaly, making the detection more reliable. The correlation between the two different modes of information improves the accuracy and reduces the risk of false alarms.

## E. Dataset Description and Preprocessing

The effectiveness of ARGUS depends on training and evaluation using datasets that reflect realistic urban scenarios.

Visual Datasets: The UCF Crime dataset acts as the primary benchmark for anomaly detection, which includes events such as fighting, robbery, and vandalism. Simultaneously, the Hockey Fight dataset provides samples of high-intensity interactions that contribute to an accurate modeling of aggressive behavior patterns.

Audio Datasets: The datasets UrbanSound8K and ESC-50 will be used to identify the distribution of sounds in an environment and train the anomaly detection model. The two datasets contain a variety of different classes from human voices to siren noises and even ambient urban noises.

Preprocessing: The video modality undergoes normalization with respect to frame rates, whereas audio is normalized with a sample rate of 16 kHz monaural format. The synchronization process can be achieved by means of timestamps. However, even after taking such measures, the problem of the domain shift remains.

## F. Implementation Details

ARGUS is built upon an efficient, speedy software infrastructure designed for the edge. Its key components include OpenCV for video processing, Ultralytics YOLOv8 for object recognition, and Librosa for audio feature extraction. The architecture of the system enables its video and audio processing pipelines to operate concurrently, thus providing high throughput.

Its response time of less than 500 ms makes the solution applicable to real-time applications. Being optimized for the edge, ARGUS reduces bandwidth usage, enhances data privacy, and ensures seamless scalability in a networked environment.

## G. Experimental Setup and Evaluation Protocol

In order to assure reproducibility and an objective evaluation of the ARGUS methodology, we adopt a standard experimental procedure regarding the splitting of data, the training of the system, and its hyperparameters. Such an evaluation strategy is typical for multimodal surveillance research as well as deep learning studies.

1) Dataset Splits: The datasets are partitioned into training, validation, and testing subsets to enable unbiased performance evaluation and prevent overfitting.

- Training Set (70%): Used for model learning.
- Validation Set (15%): Used for hyperparameter tuning.
- Test Set (15%): Used for final evaluation.

In video data such as UCF-Crime, splitting occurs on the video basis to avoid any temporal data leakage, which is typical in anomaly detection problems. In audio data like UrbanSound8K and ESC-50, the splitting occurs in a balanced manner between the classes.

2) Training Details: The detection module makes use of YOLOv8 with pretrained weights, which is subsequently finetuned for surveillance-oriented tasks in accordance with standard real-time object detection approaches. For the task of tracking objects across frames, the DeepSORT algorithm is used.

In terms of audio processing, the focus is on spectral attributes such as the Mel-spectrogram and RMS energy.

- Optimizer: Adam / SGD, commonly used in deep learning optimization
- Loss Functions:

- Visual: Detection and classification loss
- Audio: Cross-entropy-based classification loss
- Batch Size: 16-32
- Epochs: 50-100

Regularization strategies such as early stopping and data augmentation (e.g., noise injection, spatial transformations) are employed to improve generalization, as supported by prior deep learning studies.

3) Hyperparameter Settings: The key hyperparameters in this system are shown in Table I. These choices have been made based on empirical tuning and common practice for realtime detection/classification algorithms.

TABLE I: Hyperparameter Configuration

| Parameter                                                                                                                            | Value                                                                                     |
|--------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Learning Rate Optimizer Batch Size Epochs Input Resolution Audio Sampling Rate Window Size Z-score Threshold Fusion Weights (wv, wa) | 1 × 10-3 Adam / SGD 16 / 32 50-100 640 × 640 16 kHz 1-2 seconds 2.5-3.0 Empirically tuned |

4) Evaluation Protocol: Precision, Recall, and F1-score are the criteria for measuring ARGUS. They provide a comprehensive assessment of the accuracy of event detection and the reliability of the algorithm, making it suitable for safetycritical applications.

In order to ensure fairness between models, each configuration - visual only, auditory only, and multimodal - will be trained, validated, and tested under the same conditions. The multimodal predictions will also be time-aligned with timestamps prior to computing the scores in the same way as previous work that fuses multimodal features.

The performance is further evaluated under realistic settings with environmental factors such as background noise and occlusions, among others, as mentioned in the recent surveillance literature.

## IV. RESULTS AND DISCUSSION

## A. Quantitative Evaluation

For a comprehensive evaluation of the ARGUS system, it is essential to make use of well-known classification parameters such as Precision, Recall, and F1 score. Such metrics provide an impartial way of estimating the accuracy of problem detection, which is highly desirable in critical systems.

Precision measures the proportion of correctly identified positive events among all predicted positives, while Recall quantifies the system's ability to detect actual threat events. The F1-score represents the harmonic mean of Precision and Recall.

Fig. 1. Performance comparison across visual, audio and multimodal (ARGUS) models.

<!-- image -->

Fig. 2: Performance comparison across visual, audio, and multimodal (ARGUS) models.

$$\text {Precision} = \frac { T P } { T P + F P }$$

$$R e c a l l = \frac { T P } { T P + F N }$$

$$F 1 \text {-score} = 2 \cdot \frac { \text {Precision} \cdot \text {Recall} } { \text {Precision} + \text {Recall} }$$

TABLE II: Performance Comparison Across Modalities

| Model Variant        |   Precision |   Recall |   F1-Score |
|----------------------|-------------|----------|------------|
| Visual Only (YOLOv8) |        0.84 |     0.76 |       0.80 |
| Audio Only           |        0.79 |     0.71 |       0.75 |
| Multimodal (ARGUS)   |        0.91 |     0.88 |       0.89 |

- 1) Overall System Performance: The multimodal ARGUS framework outperforms unimodal approaches across all metrics, as shown in Fig. 2.

TABLE III: Class-wise Detection Performance

| Event Type      |   Precision |   Recall |   F1-Score |
|-----------------|-------------|----------|------------|
| Fighting        |        0.93 |     0.90 |       0.91 |
| Screaming       |        0.89 |     0.87 |       0.88 |
| Falling         |        0.88 |     0.85 |       0.86 |
| Normal Activity |        0.92 |     0.95 |       0.93 |

2) Event-wise Performance Analysis: Aggressive interactions (fighting) achieve the highest F1-score due to strong motion and audio cues, whereas falling events remain comparatively challenging (subtle temporal patterns), as illustrated in Fig. 3.

<!-- image -->

Fig. 2. Class-wise detection performance across different event categories.

Fig. 3: Class-wise detection performance across different event categories.

<!-- image -->

Fig. 4: Confusion matrix for overall threat detection (binary classification).

<!-- image -->

Fig. 5: Weighted risk score over time showing multimodal fusion behavior.

- 3) Confusion Matrix Analysis: The confusion matrix indicates high true positive rates with reduced false positives. Multimodal validation filters ambiguous detections that commonly lead to false alarms in unimodal systems.
- 4) Discussion: Multimodal fusion improves detection reliability in complex environments (noise, occlusion, crowd density). As shown in Fig. 5, the weighted risk score increases significantly when both modalities are active, confirming effective cross-modal validation.

The audio anomaly detection module remains robust under noisy conditions. Fig. 6 shows that high Z-score deviations correspond to statistically significant anomalies (e.g., screams, Time (s)

<!-- image -->

Fig. 6: Z-score based audio anomaly detection with thresholding.

<!-- image -->

Fig. 7: Latency versus accuracy trade-off across different models. impacts).

ARGUS achieves a strong balance between accuracy and efficiency. As illustrated in Fig. 7, it maintains higher accuracy while operating at low inference latency, making it suitable for edge deployment.

While minor challenges persist in extreme scenarios (dense crowds, low light), the system demonstrates strong robustness and real-time applicability.

## V. CONCLUSION

This paper presents ARGUS, a multi-modal and edge-native framework for proactive safety monitoring using vision and sound to measure behavior.

Key results indicate that integration of multiple modalities improves detection accuracy and reduces false positives. The risk score and edge-based implementation achieve near-realtime performance with latency less than 500 milliseconds.

ARGUS provides a basis for future intelligent surveillance systems, with plans to increase data collection and consider privacy-friendly implementation in future research.

## REFERENCES

- [1] Q. Wang, G. Feng, and Z. Li, "A Lightweight Person Detector for Surveillance Footage Based on YOLOv8n," Sensors, vol. 25, no. 436, 2025.
- [2] F. Zhu-Zhou et al., "Robust Energy-Efficient Audio-Based Anger Detection System for Noisy Environments," IEEE, 2023.
- [3] Y. Kim, D. Jang, and S.-P. Lee, "Robust Scream Detection and Scream Temporal Interval Prediction Using CNN-Transformer and Windowing CNN," IEEE Access, 2025.
- [4] W.-F. Pang, Q.-H. He, Y.-J. Hu, and Y.-X. Li, "Violence Detection in Videos Based on Fusing Visual and Audio Information," ICASSP, 2021.
- [5] P. Lestari et al., "Multi-Authentication Security for Proactive Defense Using Multimodal Fusion," IJRSMT, 2025.
- [6] D. M. Sundaram, S. Mannam, and S. Jayachandran, "Intelligent Video Surveillance for Human Behavior Analysis and Anomalous Activity Detection using Deep Learning," ICSCSA, 2025.
- [7] S. S and J. G. J., "Human Behaviour and Abnormality Detection using YOLO and Conv2D Net," ICICT, 2024.
- [8] A. Farhan et al., "Deep Learning-Based Weapon Detection Using YOLOV8," IJIST, 2025.
- [9] IDG-ViolenceNet, "A Video Violence Detection Model Integrating Identity-Aware Graphs and 3D-CNN," Sensors, 2025.
- [10] Violence-MFAS, "Audio-Visual Violence Detection Using Multimodal Fusion Architecture Search," 2023.
- [11] J. Redmon et al., "You Only Look Once: Unified, Real-Time Object Detection," in Proc. IEEE CVPR, 2016.
- [12] A. Bochkovskiy et al., "YOLOv4: Optimal Speed and Accuracy of Object Detection," arXiv:2004.10934, 2020.
- [13] N. Wojke et al., "Simple Online and Realtime Tracking with a Deep Association Metric," in Proc. IEEE ICIP, 2017.
- [14] K. Simonyan and A. Zisserman, "Two-Stream Convolutional Networks for Action Recognition in Videos," in Advances in NeurIPS, 2014.
- [15] C. Feichtenhofer et al., "Spatiotemporal Multiplier Networks for Video Action Recognition," in Proc. IEEE CVPR, 2017.
- [16] K. J. Piczak, "ESC: Dataset for Environmental Sound Classification," in Proc. ACM Int. Conf. Multimedia, 2015.
- [17] J. Salamon et al., "A Dataset and Taxonomy for Urban Sound Research," in Proc. ACM Int. Conf. Multimedia, 2014.
- [18] S. Hershey et al., "CNN Architectures for Large-Scale Audio Classification," in Proc. IEEE ICASSP, 2017.
- [19] I. Goodfellow, Y. Bengio, and A. Courville, Deep Learning, MIT Press, 2016.
- [20] A. Krizhevsky et al., "ImageNet Classification with Deep Convolutional Neural Networks," in Advances in NeurIPS, 2012.