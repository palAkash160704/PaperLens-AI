Research Vehicle Engineering—Review Large-Scale Vehicle Platooning: Advances and Challenges in Scheduling and Planning Techniques

Jing Hou a , Guang Chen a,b,⇑ , Jin Huang c , Yingjun Qiao d,e

, Lu Xiong a , Fuxi Wen c , Alois Knoll f ,

Changjun Jiang e a School of Automotive Studies, Tongji University, Shanghai 201804, China b College of Electronic and Information Engineering, Tongji University, Shanghai 201804, China c School of Vehicle and Mobility, Tsinghua University, Beijing 100084, China

d College of Transportation Engineering, Tongji University, Shanghai 201804, China e Chinese Academy of Engineering, Beijing 100088, China f School of Computation, Information and Technology, Technical University of Munich, Munich 80333, Germany

article info Article history:

Received 10 November 2021 Revised 25 August 2022 Accepted 27 January 2023 Available online 23 April 2023

Keywords: Autonomous vehicle platoon Autonomous driving Connected and automated vehicles

Scheduling and planning techniques

## abstract

Through vehicle-to-vehicle (V2V) communication, autonomizing a vehicle platoon can significantly reduce the distance between vehicles, thereby reducing air resistance and improving road traffic effi￾ciency. The gradual maturation of platoon control technology is enabling vehicle platoons to achieve basic driving functions, thereby permitting large-scale vehicle platoon scheduling and planning, which is essential for industrialized platoon applications and generates significant economic benefits.

Scheduling and planning are required in many aspects of vehicle platoon operation; here, we outline the advantages and challenges of a number of the most important applications, including platoon forma￾tion scheduling, lane-change planning, passing traffic light scheduling, and vehicle resource allocation.

This paper’s primary objective is to integrate current independent platoon scheduling and planning tech￾niques into an integrated architecture to meet the demands of large-scale platoon applications. To this end, we first summarize the general techniques of vehicle platoon scheduling and planning, then list the primary scenarios for scheduling and planning technique application, and finally discuss current chal￾lenges and future development trends in platoon scheduling and planning. We hope that this paper can encourage related platoon researchers to conduct more systematic research and integrate multiple pla￾toon scheduling and planning technologies and applications.

 2023 THE AUTHORS. Published by Elsevier LTD on behalf of Chinese Academy of Engineering and Higher Education Press Limited Company. This is an open access article under the CC BY-NC-ND license (http://creativecommons.org/licenses/by-nc-nd/4.0/).

1. Introduction A vehicle platooning system uses communication technology to organize multiple vehicles to drive in a queue in order to improve traffic efficiency [1]. As depicted in Fig. 1, vehicles in a platoon are

permitted to travel in formation and maintain a very close distance between each other, while the rear vehicles are capable of autono￾mous driving. Decreasing the distance between vehicles can signif￾icantly reduce air resistance, reduce fuel consumption, and increase road capacity at the same time [2,3].

Platoon technology has been progressively developed from cruise control (CC) technology via the adaptive CC (ACC) and coop￾erative ACC (CACC) technologies; accordingly, its degree of driving automation, as specified in the Society of Automotive Engineers (SAE)’s standard J3016 [4], is gradually improving. The fundamen￾tal CC function can be regarded as a level 1 (L1) driver assistance

function [4]. Typically, a CC system employs an electronic throttle to track a fixed speed preset by a driver in a closed loop using straightforward logic. When there is an obstacle in front, the driver must take over control of the vehicle, so this function is typically

only used on a highway. In comparison, the upgraded ACC system can be considered a level 2 (L2) partial autonomous driving func￾tion. The ACC system has enhanced ability to perceive a vehicle in front, which allows the ego vehicle to maintain a safe distance behind a preceding vehicle. The further upgraded CACC [5] and

https://doi.org/10.1016/j.eng.2023.01.012 2095-8099/ 2023 THE AUTHORS. Published by Elsevier LTD on behalf of Chinese Academy of Engineering and Higher Education Press Limited Company.

This is an open access article under the CC BY-NC-ND license (http://creativecommons.org/licenses/by-nc-nd/4.0/). ⇑ Corresponding author.

E-mail address: guangchen@tongji.edu.cn (G. Chen). Engineering 28 (2023) 26–48 Contents lists available at ScienceDirect Engineering

journal homepage: www.elsevier.com/locate/eng

platoon [6] technologies, which are at level 3 (L3; conditional driv￾ing automation) and level 4 (L4; high driving automation), are highly automatic driving technologies, due to their ability to liber￾ate the driver from control over the accelerator, brake, and steering wheel. In a CACC system, the front or leader vehicle is not only pas￾sively perceived by the rear or follower car but actively communi￾cates with the rear car and sends its own speed, steering wheel angle, and accelerator and brake signals. In this way, the following

vehicles can make more reasonable decisions. In comparison with a CACC system, a platoon system can further reduce the distance between vehicles to 0.4 m, which greatly reduces air resistance and improves road traffic efficiency [7]. This collaborative driving

technology can share perception and decision-making information, significantly enhancing the perception ability of the autonomous driving system. However, platoon technology is limited to specific scenarios of vehicle formations, so it is not expected to be devel￾oped into a level 5 (L5; full driving automation) technique.

Longitudinal spacing control and communication technologies are the foundation for platoon driving [8–10], making them the primary focus of early research in this area. In recent years, how￾ever, techniques for platoon scheduling and planning that can improve platoon operation efficiency have been extensively stud￾ied. The first technique to be studied in scheduling and planning

was longitudinal velocity planning, which evolved from longitudi￾nal spacing control [11]. Unlike single-vehicle velocity planning [12], vehicle platoon velocity planning must also account for vehi￾cle spacing and string stability. Next, the velocity planning of pla￾toon grouping and separation was further expanded [13]. The velocity planning of a vehicle platoon passing a traffic light is a similar research field but is restricted to passing through green

lights [14]. Longitudinal velocity planning was further extended to the field of lateral trajectory planning. Due to the long total length of a vehicle platoon, it is a challenge to plan the lateral tra￾jectory of the platoon for lane changing. According to research, establishing dedicated lanes for vehicle platoons is a feasible solu￾tion [15]. Lastly, the related research expanded from the field of

microscale vehicle dynamics control to the field of macroscale freight dispatching and vehicle platoon formation scheduling [16].

In general, the platoon control technique focuses on the relative positional relationship between the vehicles within the platoon; that is, it focuses on a small-scale vehicle platoon system. In com￾parison, the platoon planning technique pays more attention to the overall future state of the platoon within its environment and

makes predictions and adjustments to it. The platoon scheduling technique, on the other hand, pays greater attention to the status of all platoon-related systems in a specific region and makes arrangements so that a large-scale platoon system can operate effi￾ciently as a whole. The overall structure of a platoon scheduling

and planning system is summarized in Fig. 2, with vehicle platoons, roadside controllers, and cloud servers communicating various types of information to achieve efficient scheduling. Longi￾tudinal control of the vehicles in the platoon is usually coordinated by the vehicles, which transmit their respective positions and

speed control commands to each other. When the platoon passes through certain road structures, the platoon leader communicates with the roadside controller to obtain the recommended passing speed planned by the controller. The platoon formation function

is realized by cloud services. Each individual vehicle sends its own driving task to the server to obtain the driving route in order to join the platoon. In addition, the roadside controller can commu￾nicate with the cloud server to achieve precise control of traffic equipment such as traffic lights.

Existing reviews in this field primarily concentrate on the longi￾tudinal spacing control and communication system of the platoon, although some provide summaries that focus on safety or projects.

At present, platoon technology has developed to a critical point and is about to enter large-scale commercial use. Many platoon scheduling and planning techniques have been studied in order to realize the exceptional value of platoon technology for commer￾cial freight. However, these scheduling and planning techniques

have not been adequately summed up, and it is challenging to inte￾grate them into a system that maximizes the commercial value of platoon technology. Therefore, it is both urgent and necessary to conduct a macro-level review of scheduling and planning tech￾niques for large-scale vehicle platoons. One of the contributions of this paper is to summarize existing platoon-related scheduling

and planning techniques to form a comprehensive scheduling and planning system. This paper not only summarizes the methods of scheduling and planning algorithms but also sorts out project applications. This paper is dedicated to answering the following

questions: (1) What methods can be used for scheduling and planning a vehicle platoon? (2) What are the practical applications of vehicle platoon

scheduling and planning? (3) What shortcomings exist in applications of vehicle platoon scheduling and planning, and how can platoon technology be fur￾ther implemented? The scope of this work includes concepts, techniques, applied

projects, and future developments related to platoon macro scheduling and planning. The sections of the paper are organized as depicted in Fig. 3. Section 2 provides a summary of the related reviews and practical application platoon projects. In Section 3,

the fundamental algorithm techniques that can be used for vehicle platoon scheduling and planning are introduced, answering the first research question posed above. Section 4 presents the applica￾tions of vehicle platoon scheduling and planning. It describes in depth the related technologies of platoon formation, passing traffic

lights, changing lanes, and resource allocation, and responds to the second research question. Next, Section 5 introduces the simulation platforms and datasets that can be used for vehicle platoon scheduling and planning. In Sections 6 and 7, we

Fig. 1. Heavy-duty vehicle (HDV) platooning to collectively realize autonomous driving and efficient transportation. (a) The Westwell Q-Truck of Qomolo focuses on autonomous heavy-duty trucks for modern container logistics. (b) The 5G + level 4 (L4) project from SAIC Motor Corporation Limited (China) focuses on shortening the distance between trucks running in a queue on a bridge to improve transportation efficiency. (c) The Tongji University Guided Autonomous Logistics Vehicle Platoon (GALVP) project focuses on realizing the automatic driving of rear trucks at a low cost when the first truck is driven by a human.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 27

summarize the shortcomings and challenges of vehicle platoon scheduling and planning techniques, and put forward the future development direction as the answer to the third research question.

2. A brief history of vehicle platoon research Vehicle platoon technology has gone through long-term development and is becoming increasingly mature [17]. Fig. 4 summarizes the research direction of platoon technology. In the

beginning, research mainly focused on the analysis and calculation of the convergence of the platoon control algorithm [18]; next, research was extended to platoon simulations in complex scenarios [15]. At present, many real-world platoon projects have

already begun test runs [19]. This section summarizes recent reviews related to platoons and practical projects related to platoon scheduling and planning.

In the past few years, with the improvement of communication and autonomous driving technologies, platoon technology has developed rapidly, based on the connected and automated vehicles (CAVs) technique [11,20–22]. Several comprehensive reviews have

been conducted on platoon technology, including network com￾munications, lateral and longitudinal control, human factors, and application projects. The biggest difference between the platoon technique and single-car automatic driving is that a platoon must realize mutual communication and signal transmission between its

vehicles. Several reviews have summarized communication tech￾niques in a platoon [9,23,24], some with a focus on the network security technique [25–27]. Jia et al. [23] investigated a platoon￾based vehicle cyber–physical system, including basic knowledge Fig. 2. General system structure of a platoon scheduling system. Vehicle-to-everything (V2X) communication is carried out among cloud servers, roadside controllers, and the vehicles in platoons. Various pieces of information regarding the vehicle are continuously transmitted between the devices and modules. V2N: vehicle-to-network;

V2I: vehicle-to-infrastructure; V2V: vehicle-to-vehicle. Fig. 3. Scope and sections of this paper. The scope of this survey includes concepts, techniques, applied projects, and future developments related to platoon macro scheduling and planning. GCDC: grand cooperative driving challenge; EnergyITS: energy intelligent transport system; PATH: partners for advanced transportation tecHnology.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 28

of a dynamic traffic and vehicle network system, basic control problems, simulation tools, and open issues. In addition, Ros et al. [24] investigated vehicle network simulation and modeling.

Simulation software includes communication simulation software such as Network Simulator 2 (NS-2), Network Simulator 3 (NS-3) [28], and Objective Modular Network Testbed in C++ (OMNet++), and traffic-simulation software such as Simulation of Urban Mobil￾ity (SUMO) [29], Corridor Simulation (CORSIM) [30], and Visual

Simulator (VISSIM) [31]. It is worth noting that a platoon is a very suitable scenario for visible light communication (VLC), because the trucks in a platoon usually drive within each other’s field of view. Shaaban and

Faruque [26] investigated the techniques and application of VLC in a platoon system and discussed the network security of vehicle-mounted VLC. Sun et al. [25] examined communication network security issues in CAV and summarized a variety of

network attacks and defense methods. In terms of software, some reviews have summarized works on multi-agent coordinated longitudinal and lateral control for main￾taining a platoon formation [8–11,18,32,33]. Guanetti et al. [11] investigated control and planning techniques, with a focus on

methods to improve energy efficiency. From the perspective of net￾work control, a four-element analysis framework of a platoon sys￾tem has been proposed, including node dynamics, information flow topology, formation geometry, and distributed controllers [9]. Poor control strategy will cause a small disturbance in a vehi￾cle’s position to gradually oscillate and enlarge in the platoon, finally causing the platoon to lose its stability. ‘‘String stability”

refers to whether a control strategy will gradually amplify a posi￾tion disturbance, which is a very important concept in platoon con￾trol. Feng et al. [18] focused on the string stability problem in vehicle platoon control, strictly analyzed the relationship between different string stability definitions, and compared various analysis methods. Specific longitudinal and lateral platoon maneuver con￾trol techniques such as proportional–integral–derivative (PID) con￾trol, model predictive control (MPC), sliding mode control, neural

network control, and consensus control have been summarized by Badnava et al. [34].

Other scholars have conducted reviews from the perspective of human influence and acceptance of the platoon technique [33,35,36]. Axelsson [36] investigated the research characteristics, analysis methods, risks, and solutions in the current literature from

the perspective of safety. Bevly et al. [33] summarized the human factor issue of connected autonomous vehicles and introduced the lateral control issue based on lane-changing and merging maneu￾vers. The cost analysis and business model of the platoon tech￾nique are important factors that determine whether the technique can be accepted by people and the market. For the first

time, Chen et al. [37] systematically summarized the business model of a vehicle platoon.

Reviews on practical application projects have also been published [6,19]. Tsugawa et al. [19] took the energy intelligent Fig. 4. Research direction and mainstream methods in platoon technology. We divide the various techniques into four major categories: communication, control, planning, and scheduling; it can be seen that the methods used for scheduling and planning are similar. With the improvement and development of these methods in recent years,

attention has also been paid to relevant application research. J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 29

transport system (EnergyITS) [38], KONVOI [39], PATH [40], and other projects as examples and analyzed the projects’ applied technologies, impacts, and shortcomings. Sawade and Radusch [6] introduced practical application projects on cooperative auton￾omous driving according to functions such as longitudinal control,

lateral control, and intersection collision avoidance. To highlight the main contributions of different existing reviews, we compare various reviews in Table 1 [6,9,11,18,19,22– 24,26,33,36,41]. We have noticed that most of the existing research

investigates control, communication, and human factors at a rela￾tively micro level. Since more macro-level scheduling and planning can highlight the value of platoon techniques, we attempt to sum￾marize platoon techniques from the aspects of scheduling and planning. It can be seen from Fig. 5 that the number of papers on platoon scheduling and planning techniques has grown steadily

in the past decade. More specifically, we summarize platoon scheduling and planning applications such as the platoon map￾level formation, velocity planning formation, signalized intersec￾tion scheduling, and resource allocation. In all, platoon technology has made considerable progress, which can support platoon scheduling and planning research. However, there is as yet no

review that summarizes vehicle platoon scheduling and planning techniques. In the next section, we introduce the general tech￾niques used for scheduling and planning, as a basis for specific pla￾toon scheduling and planning.

3. General techniques for scheduling and planning In this section, we summarize general techniques used in vehi￾cle platoon scheduling and planning, including rule-based meth￾ods, model-based methods, optimization methods, learning￾based methods, and multi-agent methods. The brief principles of these methods and their applications in a platoon will be intro￾duced. Initially, scholars devised rules for completing simple scheduling tasks, with heuristic methods and finite state machines

(FSMs) serving as the standard approaches. As an increasing num￾ber of vehicle and platoon models are built, high-accuracy models are being added to rule-based methods to allow for precise estima￾tions of future states. With the gradual refinement of various eval￾uation criteria, the problem of optimizing task scheduling has been studied, with integer linear programming (ILP) and dynamic pro￾gramming (DP) being among the most prevalent techniques.

Nonetheless, the increasingly complex environments and sensing devices generate a large amount of observational data, making it increasingly difficult to manually set up rules one at a time to pro￾cess the massive amount of data. Consequently, learning-based methods have gained in popularity. With the increase of intelligent

decision-making traffic participants, it is necessary to use the multi-agent method based on game theory to coordinate and bal￾ance the interests of each agent. It is worth noting that, since each method has its own advantages and disadvantages, some schedul￾ing planning methods will be used in combination to obtain good comprehensive scheduling performance, rather than keeping the

methods completely mutually exclusive. 3.1. Rule-based methods Rule-based methods are usually extracted from the experi￾ence of human experts. Due to their obvious logic, rule-based methods usually have good interpretability, and the algorithm

is usually relatively simple and has good real-time performance. However, because it is impossible to set an infinite number of rules to cover all complex real situations, the effect of this method is often poor in complex and rare situations, which lim￾its the further development of this kind of method. To solve a

problem in vehicle platoon scheduling and planning easily and quickly, many rule-based methods such as heuristic algorithms and FSMs are adopted.

3.1.1. Heuristic methods Heuristic methods usually use the knowledge summarized by human experts to build a heuristic function. At each step, the option of a high heuristic function is greedily selected for

decision-making, so as to obtain the global suboptimal solution. Compared with other strict optimization algorithms, heuristic algorithms can generally only obtain suboptimal solutions, and the gap between suboptimal and optimal solutions is difficult to

predict. However, heuristic methods usually have relatively good real-time performance and can efficiently and conveniently deploy algorithms on real-world vehicles.

In general, vehicle scheduling problems can be solved by design￾ing heuristic methods based on human experience [42–48]. For Table 1 Reviews related to platoons and the CACC system.

Category Perspective Brief summary Year Ref. Overall Communication, driver, and control Respectively summarizes the technologies of CACC system communication, driver

characteristics, and control in general 2016 Dey et al. [41] Scheduling Intersections and merging at highway on-ramps

Summarizes scheduling at intersections and merging at highway on-ramps based on the communication of connected autonomous vehicles

## 2017 Riostorres and

Malikopoulos [22] Project Energy saving Takes EnergyITS, KONVOI, PATH, and other projects as examples and analyzes their applied technologies, impacts, and shortcomings 2016 Tsugawa et al. [19]

Cooperative automated driver assistance Introduces application projects of platooning according to functions such as longitudinal control, lateral control, and intersection collision avoidance

## 2015 Sawade and

Radusch [6] Human factor Safety Investigates the research characteristics, analysis methods, risks, and solutions of current research from the perspective of safety 2017 Axelsson [36]

Lane changing and merging Summarizes the human factor issue of platooning and introduces the lateral control issue based on lane-changing and merging maneuvers 2016 Bevly et al. [33] Control String stability Focuses on the string stability problem in vehicle platoon control and compares various

analysis methods 2019 Feng et al. [18] Network control From the perspective of network control, proposes a four-element analysis framework of the platoon system

2018 Li et al. [9] Control and planning Focuses on investigating control and planning techniques, especially methods to improve energy efficiency 2018 Guanetti et al. [11]

Communication VLC Investigates the techniques and applications of VLC in the platoon system, and discusses the network security of vehicle-mounted VLC

## 2020 Shaaban and

Faruque [26] Vehicular cyber–physical systems Investigates the platoon-based vehicle cyber–physical system, including basic control

problems, simulation tools, and open issues 2016 Jia et al. [23] Simulation Focuses on the investigation of vehicle network simulation and modeling, including communication simulation and traffic simulation

2014 Ros et al. [24] J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 30

example, heuristic algorithms can be used to find an approximate optimal solution for vehicle platoon formation scheduling in a large-scale scenario [42]. A heuristic algorithm can greatly save computing time on the premise that the result is close to the opti￾mal solution. Heinovski and Dressler [46] used heuristics to con￾sider a formation of platoons on a highway. One of their

contributions was to compare the use of distributed heuristic meth￾ods and centralized heuristic methods. Their results showed that the performance of the distributed heuristic algorithm was slightly worse than that of the centralized method, resulting in more vehi￾cle speed adjustments. Heuristic formulas can also be used to deter￾mine the vehicle speed at each stage of an intersection, thereby reducing the time needed for vehicles to pass through the intersec￾tion [47]. Although the heuristic method is convenient, efficient,

and has good real-time performance, it is usually only used as a backup method to ensure real-time performance in large-scale sit￾uations, or used for problems with little optimization space.

3.1.2. Finite state machine The FSM method, as the name implies, is composed of the finite states of different functional modes. The system can only be in one state at a time, so it switches between states based

on the various events triggered. The function of the FSM is mainly to describe the state sequence experienced by the agent in its life cycle and the response to various external events. The vehicle merging process can be divided into four FSM processes:

pace making, simultaneous pair-up, sequential pair-up, and safe￾to-merge [49]. These processes are switched according to the positional relationship of each vehicle. However, Wang et al.

[47] focused on specific velocity planning during the merging process. They divided the velocity guidance into four stages:

the free driving stage, the first velocity regulation stage, the cruise stage, and the second velocity regulation stage.

Amoozadeh et al. [50] not only designed an FSM for the platoon-merging process but also designed an FSM for the pla￾toon split and lane-changing operations. For example, the split process includes the split request, split response, and split exe￾cution status. However, the disadvantage of the FSM lies in its finiteness. When encountering increasingly complex environ￾ments, new states must be constantly added. It is difficult for

an FSM to deal with a complex environment containing an infi￾nite number of different situations. In an FSM, adding a new state may conflict with the original states, and too many states will cause the jump logic to be very complicated. Therefore, for complex environments in platoon decision-making, the FSM

currently tends to be replaced by the reinforcement learning (RL) method [51–54].

3.1.3. Artificial potential field (APF) The APF method is a simple multi-objective path planning method whose potential field function is usually designed according to safety, fuel conservation, speed, and so on. The basic

principle of the APF method is to simulate a variety of evaluation functions on the spatial scale as a potential field, thereby simulating the motion of the agent in the space by force. In this way, the motion trajectory of the agent in space is a relatively opti￾mal trajectory that meets multiple evaluation criteria at the same

time. Semsar-Kazerooni et al. [55] were the first to use a one￾dimensional (1D) Morse-like potential field function to control the longitudinal spacing of vehicles in a platoon. With this poten￾tial field function, the algorithm calculates a virtual repulsion force for backward motion when the vehicle gets too close, thus requir￾ing the vehicle actuators to slow down and back to avoid a colli￾sion. On the other hand, when the spacing is too far, high air

resistance also produces high potential energy, which drives the vehicle to accelerate to close the gap. Simulations showed that these researchers’ control methods were more stable and secure than proportional differential (PD) control. Furthermore, Semsar￾Kazerooni et al. [56] decomposed the potential functions into the

repulsive and attractive potential functions, and replaced the Morse-like function with a polynomial function in the repulsive potential function for design flexibility.

In addition, Gao et al. [57] expanded the 1D potential field of the vehicle spacing to a two-dimensional (2D) potential field in the top view, although they still only performed longitudinal vehicle spac￾ing control, and the vehicle lateral lane-changing control was com￾pleted by other modules. McCrone et al. [58] performed CACC vehicle lateral and longitudinal control in a 2D top-view potential

field. In addition to the car potential of avoiding the collision and closing the gap, the road potential and speed potential are also considered, keeping the vehicle in the correct lane and coordinated velocity. Huang et al. [59] also perform lateral and longitudinal

vehicle control on the top view, but their contribution is to use the potential filed method to plan a complete platoon driving path instead of the greedy algorithm [60] that moves according to the direction of the potential field at each step. In addition, they also

consider the potential field of the driving direction, adding a third dimension to the potential field. However, the defect of the APF method is that the agent greedily receives force in the field and Fig. 5. The number of platoon scheduling and planning papers in the past decade, which is steadily increasing. (a) Papers published in Science Citation Index (SCI) journals.

We classify these papers based on several directions, such as formation, intersection, and lane-change. (b) Papers based on real-world projects, including EnergyITS, Safe Road Trains for the Environment (SARTRE), and GCDC 2016.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 31

may fall into a local optimum situation. Therefore, the APF method usually needs to be combined with other optimization search tech￾niques to obtain a trajectory with good global performance [59,61].

In general, the APF method is simple and elegant, and considers more environmental information than other rule-based methods, so it can deal with a large number of obstacles in the environment with low computational cost.

3.2. Model-based methods The model-based method analyzes the dynamic model of the controlled object to implement control, such as inverse dynamic control or MPC. In the fields of platoon-related vehicles and trans￾portation, the system model is usually relatively large and com￾plex. Due to the development of vehicle and traffic theory,

increasingly complex vehicle and traffic models have been estab￾lished, based on which better algorithmic control can be carried out.

3.2.1. Vehicle system dynamics The vehicle system dynamics model can provide theoretical support, such as convergence, for various control algorithms. In the process of vehicle macro scheduling, longitudinal dynamics is

often used to estimate vehicle travel time. For example, the vehicle longitudinal system dynamics can be used to search for opportuni￾ties for vehicle pairing to form a platoon [62]. However, due to the uncertainty of the model, Zhang et al. [13] estimated the uncer￾tainty of the travel time to ensure that the freight task could be completed within the time window. In addition, a vehicle platoon

passing through multiple signal light intersections is a more micro￾scale application scenario that requires a higher precision vehicle dynamics model. Therefore, Ye et al. [63] and Liu et al. [64] used complex longitudinal dynamics to plan the velocity trajectory of a vehicle platoon passing through intersections.

3.2.2. Model predictive control When the model of a controlled object is known, the use of MPC can usually achieve precise and good performance control effects [65–69], although the calculation time of MPC is relatively long.

An and Talebpour [66] used a basic MPC method to plan the lane-changing trajectory of the leading vehicle in a platoon. They continuously planned multiple lane-changing trajectories and selected the one with the lowest cost function for tracking, defeat￾ing the Swaroop controller in terms of comfort. Huang et al. [65]

not only planned the lateral lane-changing trajectory but also planned the combined lateral and longitudinal trajectory based on a vehicle kinematics model in the APF to obtain the approxi￾mate optimal trajectory of the overall vehicle platoon. The MPC method can also be used for platoon macro route planning. Baskar

et al. [67] applied several methods to model an automatic highway system (AHS) in order to obtain higher model accuracy, so that the MPC method could achieve better performance in obtaining global routes. MPC performance depends on the accuracy of the provided

model; however, a sophisticated model will make it difficult to ensure the real-time performance of the algorithm, so it is neces￾sary to balance accuracy and speed in a practical application process.

3.3. Optimization methods Most scheduling and planning problems can be formulated as optimization problems. After modeling such a problem as a stan￾dard optimization problem, it can be solved using one of many existing classic optimization solvers [70–74]. For example, the

vehicle platoon group problem can be modeled as an optimization problem that adjusts the desired speed of each vehicle to optimize fuel consumption [71]. Such a multi-constrained multi-variable nonlinear function optimization problem can be solved using

Matlab’s ‘‘fmincon” function. 3.3.1. Integer linear programming Linear programming problems are optimization problems in which the objective function and constraints are linear. The ILP

problem adds the constraint that variables must be integers (on top of the constraints of linear programming), which further increases the difficulty of the problem. For example, the mixed￾ILP (MILP) method can be adopted to solve the optimal route plan￾ning problem of an AHS, and an approximate method has been pro￾posed to improve real-time performance in large-scale scenarios [67]. Larsson et al. [42] formulated the vehicle platoon formation

problem as an ILP problem and used an existing ILP solver to solve it. However, due to the complexity of the problem, it is still neces￾sary to use heuristic methods to solve this problem quickly in large-scale scenarios. The branch and bound method can be adopted to solve the mixed-integer programming problem,

thereby setting the traffic light delay and offset to make the vehicle platoon pass the main road faster [75].

3.3.2. Dynamic programming The DP method solves complex problems by decomposing the original problem into relatively simple sub-problems; it can only be applied to problems with optimal substructures. The DP method

can be used to solve the optimal path planning problem of vehicles entering platoons [76]. Using the DP method allows fewer comput￾ing resources to be used, while ensuring optimality. Johansson et al. [77] extended the DP method to plan the optimal speed tra￾jectory of a vehicle platoon during deceleration, thereby reducing fuel consumption by about 80%. Data-driven adaptive DP (ADP)

can also be adopted to carry out CC of a vehicle platoon, so as to continuously approach the optimal control through learning and shorten the travel time [78].

3.4. Data-driven learning methods As deep neural networks have brought powerful representation capabilities, an increasing number of learning-based methods have been applied to vehicle platoon scheduling and planning technolo￾gies in recent years. For example, Chen and Sun [79] used unsuper￾vised learning to classify human driving behavior data at traffic

intersections, thereby obtaining several interpretable patterns; they then selected the optimal vehicle platoon separation strategy.

3.4.1. Supervised learning Data-driven supervised learning methods have been widely used for the lateral and longitudinal control of vehicles in platoons [80–85]. Thus far, data-driven supervised learning methods have

also begun to be used in the planning and scheduling processes of platoons. For example, based on platoon road traffic data, an urban traffic flow model can be learned to study the impact of pla￾toons on urban traffic flow [86]. In addition, traffic light data can make it easier for a platoon to pass through traffic conditions

[87]. A wind resistance model learned based on the data can make the fuel economy consideration more accurate when a platoon is grouped [88].

3.4.2. Reinforcement learning Scheduling and planning are a kind of decision-making process, and many vehicle and traffic-simulation environments have been established; thus, scheduling and planning technologies are suit￾able for the RL method, which eliminates the trouble of manually

recording and labeling datasets. In terms of platoon path planning, Chen et al. [16] used Q-learning RL to plan a high-level route for a J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 32

vehicle platoon, while reducing the travel time and fuel consump￾tion of each vehicle. Buechel and Knoll [89] improved the deep deterministic policy gradient (DDPG) RL algorithm and applied it to a platoon’s longitudinal control. The agent determines its acceleration by observing the vehicles’ spacing and speed. Exces￾sive acceleration will lead to penalties, to avoid poor comfort and

high fuel consumption. In addition, the DDPG RL algorithm has been used to plan the longitudinal speed trajectory of a following car in a platoon such that the distance between the vehicles in the platoon remains reasonable, which not only reduces air resis￾tance but also ensures safety [90]. Based on the fact that comput￾ing resources can be shared between leader and follower vehicles

in a platoon, Fan et al. [91] developed an interesting computing task pricing strategy using RL. In this strategy, the leader vehicle agent observes its own task volume and the followers’ bids and determines the pricing strategy based on Q-learning, allowing it

to complete computing tasks at a lower cost in comparison with using iterative algorithms.

One of the shortcomings of RL is that it requires a considerable amount of computing resources and time for trial-and-error train￾ing; therefore, the development of more efficient RL algorithms to save training time is a mainstream research direction. In addition, the effect of RL depends on the accuracy of the simulation training

environment, so it is necessary to build a training environment that is as realistic as possible. Otherwise, the RL agent is prone to overfitting to the unreal simulation environment.

3.5. The multi-agent system A platoon consists of multiple vehicles, which means that most platoon scheduling and planning systems are multi-agent systems.

Some studies solve the vehicle platoon problem using typical methods used for multi-agent systems, such as game theory, con￾sensus algorithms, and multi-agent RL [92–94].

3.5.1. Game theory Game theory studies the winning probability of multiple play￾ers in a game, their respective strategies, and the final equilibrium.

It can be widely used in platoon formation matching, velocity plan￾ning, and resource scheduling [95–99]. In general, games can be divided into cooperative games and non-cooperative games, both of which exist in platoon scheduling applications.

The vehicle platoon matching problem can be modeled as a non-cooperative game problem [95]. Different vehicles have differ￾ent destinations and freight times, but the route and departure time can be adjusted to form a vehicle platoon to reduce air resis￾tance. It has been demonstrated that this game has a Nash equilib￾rium, and the cooperative solution can save more fuel than the non-cooperative solution. Liu et al. [96] directly modeled the prob￾lem of spacing allocation in a platoon as a cooperative game prob￾lem. Each vehicle adjusts the desired distance between itself and

the preceding vehicle according to the dynamic speed and acceler￾ation during driving, thereby ensuring the overall safety, energy saving, and coordination of the vehicle platoon. Another advantage of a vehicle platoon is that computing resources can be shared among vehicles. When a vehicle needs time-consuming calcula￾tions such as image processing, it can issue the task for other cen￾tral processing unit (CPU)-idle vehicles to complete. Researchers

have developed a price mechanism that allows computing tasks to be allocated more efficiently. They model the problem of com￾puting task allocation as a multi-leader-multi-follower Stackelberg game. By fixing the follower strategy, the leader’s pricing decision is transformed into a problem that can be solved using single-agent

## Rl [97].

3.5.2. Consensus algorithms The consensus algorithm is an iterative and distributed algo￾rithm, whose purpose is to obtain the values of the consensus parameters agreed upon by all agents. In each iteration, each agent obtains the state of itself and its neighbors, thereby updating its

consensus parameters. At present, the consensus algorithm has been widely used in the field of vehicle platoon longitudinal and lateral control [100–102]. For example, Saeednia and Menendez [100] used the consensus algorithm to make each vehicle agent

in a vehicle platoon reach a speed consensus, so that the platoon can be formed quickly and smoothly. Wu et al. [103] extended the longitude and lateral consensus control of vehicles to the for￾mation of a platoon. The order and trajectory of each vehicle enter￾ing the platoon are decided by the consensus algorithm. In addition, through stability analysis, it was found that control dis￾turbances can be added to avoid local minima in the consensus

process. When vehicle platoons pass through signal intersections, they usually regroup to form new platoons. The consensus algo￾rithm can also be applied to the reorganization process, and simu￾lation experiments show that a vehicle platoon formed by the consensus algorithm can achieve a uniform speed and time inter￾val [104].

3.5.3. Multi-agent RL (MARL) The MARL algorithm is another technique that is often used in multi-agent coordinated scheduling and planning, as there are usually numerous traffic participants in the traffic environment.

Since observations and network weights between multiple agents cannot be directly shared, MARL is usually more difficult to train than single-agent RL. However, Ma et al. [97] used RL to solve the pricing problem of edge computing tasks in a vehicle platoon.

They converted the MARL problem into a single-agent RL problem by fixing the vehicle platoon follower strategy, and then used Q-learning to solve it. Khamis and Gomaa [105] made the traffic light agents transfer the Q-value table parameters to each other,

so that they could cooperate effectively in the RL process to solve the problem of large-scale urban traffic light control. Moreover, Sharma and Singh [106] improved traditional Q-learning into cooperative RL by sharing the Q-value table, thereby reducing

interference in vehicle-to-vehicle (V2V) communication resource allocation.

In all, thanks to the continuous development of the abovemen￾tioned algorithms, a vehicle platoon can perform unprecedentedly effective, far-sighted, and real-time scheduling and planning. Most of these methods can be used in combination to complement each other, so it is difficult to say which method is best. For simple envi￾ronments and specific tasks, simple rule-based methods can

achieve stable results; for complex and uncertain tasks, deep learn￾ing methods can achieve astounding control effects. In general, however, the popular approach has gradually shifted from the sim￾ple, rule-based approach to the more-considered neural network and machine learning-based approach. There is no doubt that the study of operations research and artificial intelligence (AI) algo￾rithms will promote the application of platoon scheduling plan￾ning. Next, we will introduce the specific applications of these

methods in vehicle platoons and the technological development of each application scenario.

4. Platoon scheduling and planning applications The main areas of platoon scheduling and planning applications include platoon formation, platoon intersection scheduling, pla￾toon lane changing, and platoon resource allocation. This section summarizes the research background, progress, and future devel￾opment directions of these fields.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 33

4.1. Map-level platoon formation scheduling As shown in Fig. 6, the process of vehicle platoon formation includes macroscopic map-level formation [42,107] and micro￾scopic speed planning formation [108]. The first step of platoon scheduling is to find vehicles suitable for platoon formation and

plan their routes on the map level [107,109–111], as shown in Fig. 6(a). Since the formation of a vehicle platoon can effectively reduce air resistance, some vehicles may detour or wait at the orig￾inal starting point to form a vehicle platoon under the premise of meeting the delivery time constraints to reduce fuel consumption.

For example, a DP method has been used to solve the problem of vehicle platoon merging in a 2D map, given the location of the merging point and the merging path [76]. The considered applica￾tion scenario is that vehicles join a platoon driving along a highway around a city. The planned route must be short while enabling

vehicles to meet and join the vehicle platoon within a short period of time. Using DP algorithms can ensure the optimality of the search path with relatively few computing resources. Baskar et al. [67] suggested that vehicle platoon merging can reduce fuel

consumption when the global path of each vehicle is planned, and proposed two methods based on MILP and a macro-traffic flow model. They first established a simplified and fast traffic￾simulation model; however, planning a global path in a dynamic environment is a nonlinear non-convex integer optimization prob￾lem that is difficult to solve. Therefore, they approximated the

problem using a mixed-integer linearity problem. The researchers also proposed a macroscopic traffic flow model for human drivers.

Both methods achieved a good balance between path optimality and computational efficiency.

Larsson et al. [42] considered a large-scale traffic model with￾out a delivery deadline, using the ILP and heuristic methods to save fuel consumption, as shown in Fig. 6(b). They found that the more vehicles there are in the network, the easier it is to form vehicle platoons and save more fuel. Sokolov et al. [70]

coordinated the route planning of numerous vehicles by means of combination optimization and adjusted the departure time to form a vehicle platoon. A simulation on Polaris showed that their method increases road capacity and reduces fuel consump￾tion [112]. Considering the formation of platoon vehicles, Chen

et al. [16] applied RL to the route planning problem. Due to the large amount of calculation required by RL, they adopted edge computing on a road network based on a vehicular ad￾hoc network (VANET) [113] to speed up the planning process.

Fig. 6. Formation process of a platoon in the space and time dimensions. (a) Based on the road network topology map, map-level vehicle formation scheduling can be performed. Platoons start from suppliers and travel through nodes to customers. (b, c) An example run of the heuristic platoon pair method on the topological map. There are three trucks with different starting and ending points. The heuristic algorithm makes the trucks drive in a platoon form as much as possible. (d) The time–space diagram shows the three main phases of the formation, maintenance, and separation of the vehicle platooning.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 34

A summary of related work on map-level platoon formation is shown in Table 2 [16,42,67,70,76].

Since there is as yet no large number of vehicles with platoon or CACC functions in the real world, the abovementioned studies have only been tested in a simulation environment; moreover, only small-scale experiments are usually performed in a simulation. In

the future real environment, scheduling and planning thousands of vehicles moving in real time will present the problem of dimen￾sional explosion. Thus, future research will focus on information sharing and network routing structure issues involving numerous vehicles. At the same time, learning-based methods are being

researched for smarter and faster planning. 4.2. Platoon formation velocity planning Next, when the vehicles have been paired and approached at the macro map level, microscopic velocity planning, as shown in

Fig. 6(c) [42], is required to gradually reduce the distance among the vehicles and complete the vehicle platoon formation operation [71,100,114–119]. Faster platoon grouping enables the vehicles to travel longer distances with low air resistance, but it also causes

greater changes in the speeds of the front and rear vehicles, which may result in higher fuel consumption.

Amoozadeh et al. [50] focus on a logical protocol design based on the FSM of the vehicle platoon, including the formation of the vehicle platoon. The specific process is divided into three parts:

the merging request, merging response, and merging execution. In addition, they have developed a simulation platform, Vehicular Network Open Simulator (VENTOS), to validate the logic protocol.

The simulation platform consists of two parts: SUMO for traffic simulation and OMNET++ [120] for communication simulation.

Through mathematical analysis of the vehicle longitudinal dynamics, Zhang et al. [13] calculate the distance threshold to form a vehicle platoon that can reduce the fuel consumption, travel time, and freight default of each cargo vehicle. They also study

the scheduling of vehicle platoons in a road network, including diverging routes and convergence routes, and the scalability of the algorithm when scheduling numerous vehicles. Researchers have also conducted a coordinated optimization based on vehicle

dynamics and fuel consumption models [71]. The speed of each vehicle can be adjusted to form a truck platoon and reduce overall fuel consumption. At the same time, the delivery deadline con￾straint can be considered in the optimization problem. This research further expands the problem of vehicle platoon formation

and designs a complete integrated system that can reduce the number of empty vehicles, find opportunities for platoon forma￾tion, and reduce fuel consumption [62].

Saeednia and Menendez [108] adopt methods based on deceler￾ating the preceding vehicle and accelerating the following vehicle to construct an optimization problem for vehicle formation. In the optimization objective, they consider both the fuel consump￾tion and time consumption of the formation process. They also propose a consensus-based distributed algorithm and compare it

with the previous centralized optimization algorithm [121]. The new distributed algorithm is easier to deploy in practice, and it is more flexible in the platoon formation process. Even when there is an acceleration limit, part of the platoon can be formed first.

Table 3 [13,50,62,71,108,121] summarizes related work on the velocity planning of platoon formation.

Although real-world small-scale vehicle experiments have been conducted on vehicle velocity planning to form a platoon, many details have not yet been considered, such as traffic jams, ramps, and other road conditions. In addition, in some countries, manda￾tory rest requirements for drivers must be complied with. In the

future, larger scale and heterogeneous vehicle experiments will need to be carried out. At the same time, since the following car can save more fuel than the leading car, there is interest and value in developing a business model for profit distribution.

The platoon formation applications described above can be cat￾egorized by means of task release dynamics. In most platoon for￾mation scheduling programs, task details are known beforehand and then scheduled. A study has demonstrated that proper scheduling and planning in advance can result in substantial fuel savings and other advantages [122]. Nevertheless, to ensure accu￾rate and appropriate planning in advance, it is vital to verify that

the input data for each activity is exact and definitive. In a few cases, however, task conditions will alter in real time, requiring immediate scheduling adjustments. A natural solution to this prob￾lem would be to retrigger scheduling optimizations based on events [123,124]. On this basis, improved scheduling effects will

be realized if past data is used to predict future information in order to cope with real-time planning [125]. Due to the unpre￾dictability of traffic circumstances, uncertainty and randomness must also be factored into the real-time scheduling considerations of various inputs [13]. In general, real-time scheduling methods

strive to achieve a balance between real-time and scheduling per￾formance. In the future, however, when the vast majority of cars on the road have the platoon function, it will be practical and effective to directly construct an opportunistic platoon by means of a simple scheduling technique, given the ongoing development of platoon

technology [126]. 4.3. Platoon scheduling at signalized intersections When a vehicle platoon arrives at a signalized intersection, a scheduling algorithm is required for vehicle velocity planning

and signal light timing scheduling, as shown in Fig. 7 [79,90]. Two methods are used for vehicle platoon scheduling at intersec￾tions with traffic lights: manipulating vehicles [127–133] and manipulating traffic lights [47,75,105,134]. At present, the most widely studied method is to design a speed trajectory curve

according to the state of the vehicle platoon. Just like a single vehi￾Table 2 A summary of existing studies on map-level platoon formation.

Controlled variable Evaluation index Method Compared method Platform Ref. Merging route planning Distance and time The DP method Standard A* search Self-developed Valdés et al. [76]

Route planning Total time consumption MILP and macroscopic traffic flow model Human-controlled method Self-developed Baskar et al. [67] Fuel saving The ILP and heuristic method Solution for a German highway German road network

data Larsson et al. [42] Route planning, departure time

Fuel saving Optimization considering platoon coordination and vehicle routing Uncoordinated temporary

formation of platoons Polaris Sokolov et al. [70] Next destination Platoon formation, time, and distance

RL and Q-table Dijkstra and k-shortest algorithm Self-developed in Python Chen et al. [16] J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 35

cle driving through a traffic light, a vehicle platoon must plan its speed to pass through the intersection during the green light per￾iod. However, because a vehicle platoon composed of multiple trucks is usually very long, it is sometimes difficult for it to pass the intersection as a whole, and a reasonable separation strategy

is required. 4.3.1. Methods that manipulate vehicles Adjusting the speed of a vehicle platoon and allowing it to pass through an intersection within an existing green light window is a

relatively simple and widely studied method [119,135,136]. Feng et al. [90] proposed a vehicle platoon velocity trajectory planning strategy, as shown in Fig. 7(b) [90], which improves the throughput of traffic signal intersections compared with predictive CC (PCC). It

includes three components: platoon leader trajectory planning based on a green light optimal speed advisory (GLOSA), platoon fol￾lower spacing control based on the DDPG method, and a vehicle platoon length decision algorithm. The DDPG-based RL follower spacing controller observes the position and speed of the sur￾rounding vehicles, outputs acceleration as the action, and rewards

the distance between vehicles and safety. A vehicle platoon guidance strategy (VPGS) system can be adopted to separately formulate the trajectory of the leader vehicle and the following vehicle, while considering fuel consumption based

on the vehicle specific power (VSP) [63]. The research scenario can also be expanded from a single signalized intersection to multiple signalized intersections based on CAV, by changing the vehicle pla￾toon acceleration to obtain better safety and fuel consumption, less travel delay, increased comfort, and better intersection throughput

[64]. By optimizing the speed of each car, Timmerman and Boon [72] were able to make the vehicles in a platoon cross an intersection in a shorter time. The researchers also considered the issue of fair￾ness, because the strategy of lower overall delay at an intersection may sometimes be unfair to individual vehicles. Chen and Sun [79]

considered the separation of a platoon at signalized intersections, so that the platoon can use multiple lanes to quickly pass through Table 3 A summary of existing studies on the velocity planning of platoon formation.

Controlled variable Evaluation index Method Compared method Platform Ref. Vehicle operation General applicability FSM logical protocol None VENTOS, SUMO, and OMNET++ Amoozadeh et al. [50]

Vehicle speed Fuel saving Optimization coordination Advanced models used by Scania

Real driving data in Sweden Liang et al. [71] Efficiency of the

transportation system Vehicle longitudinal dynamics None Real driving data in

Sweden Liang et al. [62] Time required for platoon formation

Hybrid platoon strategy Catch-up strategy and deceleration strategy Empirical data collected in Basel, Switzerland

Saeednia and Menendez [108] Formation/modification of platoon Versatility in complex

situations such as large intervals Consensus-based distributed algorithm

Centralized optimization algorithm Empirical data collected

in Basel, Switzerland Saeednia and Menendez [121] Vehicle departure time Travel time, delay fines, and fuel costs

Vehicle system dynamics considering uncertainty None Self-developed Zhang et al. [13] Fig. 7. Scenario illustration of a platoon operating in the vicinity of an intersection. (a) Platoons can use V2X communication with the traffic light equipment to convey

information about the spatial dimension to quickly pass the intersection. (b) The planned velocity trajectories of platoons at intersections with signals in the temporal dimension. The thick red dashed line represents the red time window of the traffic light, while the thin green dashed line represents the green time window of the traffic light.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 36

intersections. At the same time, the driving style of other manned vehicles can be predicted, which makes the vehicle separation strat￾egy safer and more efficient [137].

4.3.2. Methods that manipulate traffic lights Another traffic scheduling method for dealing with signalized intersections is to adjust the offset between arterial intersections.

A layered method combining a branch and bound algorithm with a relaxation coefficient can be used to optimize the dual goals of reducing delay and decreasing emissions [75]. Khamis and Gomaa [105] applied MARL to traffic light control. They adopted a new col￾laboration method between traffic light agent controllers, which is

based on spreading learned knowledge from a highly educated agent to a neighboring agent with less knowledge. Simulation experiments on the green light district (GLD) platform showed that their method reduced the number of stopping times, saved on tra￾vel time, improved safety, and reduced energy consumption. Since

the traffic light is used as the RL agent, the observation space is the location of the surrounding vehicles, the action space is the display of red or green lights, and the reward is the traffic flow and vehicle waiting time. A joint control model was established to simultane￾ously adjust the vehicle platoon speed and traffic signal light tim￾ing in order to maximize the traffic capacity at an intersection [47].

Research related to platoon scheduling at signalized intersections is summarized in Table 4 [47,63,64,72,75,79,90,105,138].

At present, most traffic intersection scheduling work is still at the simulation level and lacks practical verification; thus, more consideration must be given to situations involving crossing inter￾sections along with non-autonomous vehicles. In the future, it will be necessary to extend research on a single intersection or a series

of intersections to include large-scale intersection networks and to further combine vehicle platoon velocity planning with signal light duration control. In combination with this work, the influence of signal intersections on the string stability of the vehicle platoon

can be studied. 4.4. Platoon lane-changing planning During the driving of an autonomously driven platoon, it is dif￾ficult to perform lane-changing maneuvers due to the long overall length. Many studies have used V2V communication, as shown in

Fig. 8, to cooperate among the vehicles in the platoon in order to complete platoon lane changing [139–141].

Amoozadeh et al. [50] took lane-changing into consideration when formulating a vehicle platoon management agreement and adopted SUMO’s default lane-changing model LC2013 as the specific maneuver strategy. Dos Santos et al. [49] expanded the grand coop￾erative driving challenge (GCDC) 2016 protocol, focusing on the two

steps of sequential pair-up and safe-to-merge. Compared with the original protocol and SUMO’s default lane-changing strategy, the new protocol significantly improves the total lane-merging time.

Dos Santos and Wolf [92] further adopted a multi-agent distributed probability collectives method for vehicle lane-changing planning; its performance is close to that of centralized planning.

An and Talebpour [66] used the MPC method to plan the lane￾changing trajectory of an autonomous vehicle platoon. The lane￾changing trajectory they used was a sixth-order polynomial curve, and the optimization goal was to reduce the lane-changing acceler￾ation so as to obtain a smooth lane-changing trajectory. The researchers combined and optimized the lateral and longitudinal movement of the vehicles during the lane changing, reduced the

distance shock wave caused by the lane changing, and ensured the string stability of the platoon. Huang et al. [65] performed MPC based on the APF model and the vehicle kinematics model to obtain the approximate optimal path of a vehicle platoon. We

summarize the related work on the lane-changing maneuvers of platoons in Table 5 [49,50,66,92,142].

Fig. 8. Double lane changing of a platoon to overtake obstacle vehicles in front. The blue dotted line represents the lane-changing trajectory of the platoon. The platoon can achieve overtaking through a planned double lane-changing trajectory. hostCar: the host car in platoon that needs to perform a lane-changing maneuver; obCar: the obstacle car that prevents the platoon from changing lanes; V: the initial velocity of the platoon; V1, V2, V3: the initial speed of the three obstacle cars.

Table 4 A summary of existing studies on platoon scheduling at signalized intersections.

Controlled variable Evaluation index Method Compared methods Platform Ref. Traffic signal decision Trip stop times and trip time Enhanced multi￾objective RL Single-objective controller

GLD Khamis and Gomaa [105] Acceleration of the lead car and the following car Throughput, vehicle stopping,

and emissions GLOSA DDPG Greedy strategy and PCC Self-developed

in Python 3.6 Feng et al. [90] Planning speed Fuel consumption VPGS based on vehicle longitudinal dynamics

The strategy only considers speed VISSIM Ye et al. [63] Speed and signal light Stop time and delay Joint control model Maxband [138] VISSIM/Matlab Wang et al. [47]

Platoon acceleration Throughput, comfort, travel delay, fuel consumption, and safety CAV traffic control Other smart speed

planning methods Not mentioned Liu et al. [64] Offset between main road intersections

Delays and emissions of main roads Branch and bound method

Existing timing plan VISSIM Ding et al. [75] Speed profile Throughput, travel delay, and fairness Optimization-based

method SUMO adaptive control SUMO Timmerman and Boon [72] Vehicle separation

strategy Communication efficiency, safety, and energy consumption Predicts the driving

style of manned vehicles Without driving style prediction

Self-developed VR-based test platform Chen and Sun [79] VR: virtual reality.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 37

Because a practical vehicle platoon lane-changing experiment is quite dangerous, the existing studies are generally based on simu￾lation platforms, and practical problems such as communication delay are rarely considered. Most current research assumes that all vehicles have communication functions. In practice, however,

most vehicles are driven manually, and it is necessary to consider the platoon lane-changing problem in a scenario with mixed traffic including both autonomous vehicles and manual vehicles. In a con￾gested environment, it may be difficult for a long platoon to change lanes, so more flexible methods are needed, such as changing the

vehicle gap and changing lanes in different groups. 4.5. Platoon resource-allocation scheduling With the widespread application of the Internet of Vehicles (IoVs) and the growth of freight logistics, the amount of multi￾source information that needs to be processed by a highway sys￾tem is rapidly increasing, and processing this information requires

a great deal of computing and storage resources [143]. In a platoon system, the ability of a single vehicle or a single platoon to perceive and process information is limited, and the system must transmit information between a cloud computing system and the platoons

for joint processing. Therefore, the issue of how to improve the uti￾lization of vehicle cloud computing resources is the key in improv￾ing the information-processing efficiency of vehicle platoon systems. Existing research has studied the resource-allocation optimization problem in cloud computing and communication engineering, as well as resource-allocation scheduling optimiza￾tion schemes for a vehicle platoon system. The specific resources

to be scheduled include communication resources and computing resources.

4.5.1. Communication resources As we know, V2V communication is the foundation of platoon technology. Based on the increasingly rich perception of informa￾tion and the increase in communication content, Xu et al. [144] proposed a cooperative perception approach among multiple

agents, which optimizes the balance between performance and communication bandwidth resources. Reasonable communication resource allocation can achieve lower communication delay and power consumption, as well as better platoon control performance

[145–150]. Device-to-device (D2D) multicast and enhanced multi￾media broadcast multicast service (E-MBMS) communications can be used for sub-channel allocation and power control, as shown in Fig. 9, thereby reducing communication interference, communica￾tion delay, and power consumption [146]. Mei et al. [73] combined the radio resource-allocation problem with the platoon longitudi￾nal control problem for joint scheduling. They first used the bipar￾tite graph method for wireless resource allocation and then used

heuristic gradient descent to adjust the platoon member vehicle Table 5 A summary of existing studies on lane-changing maneuvers of platoons.

Controlled variable Evaluation index Method Compared method Platform Ref. Vehicle operation General applicability SUMO’s default lane-change model LC2013 None VENTOS, SUMO, and

## Omnet++

Amoozadeh et al. [50] Merging operation Merging time, platoon length, and platoon speed Variants of GCDC interactive

protocol GCDC 2016 and SUMO’s methods SUMO Dos Santos et al. [49]

Vehicle lane changing Driving time, platoon length, and platoon speed Distributed modeled machine learning

SUMO’s default method SUMO Dos Santos and Wolf [92] Lateral and

longitudinal control Acceleration disturbance and jerk amplitude

Co-optimized MPC Swaroop’s controller [142] Not mentioned An and Talebpour [66] Fig. 9. Illustration of multi-platoon resource allocation on a highway. Multiple platoons use the communication station to allocate computing resources and communication

resources. When platoons travel out of the communication range of the base station, related settlement operations will be carried out. J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 38

parameters to minimize tracking error. Sharma and Singh [106] applied cooperative RL (C-RL) to the problem of wireless resource allocation between vehicles to improve V2V throughput.

In the process of communication resource scheduling, network security and network attacks are an important aspect to be consid￾ered. In terms of network attack resistance, a distributed filtering method has been proposed to resist the spoofing attacks and service-denying attacks [151]. A neural network-based adaptive

event-triggering method can also be used to control communica￾tion scheduling in order to defend against network attacks [152]. With the continuous development of security control and attack￾detection technology in industrial cyber–physical systems [153,154], communication control based on dynamic event trigger￾ing has been successfully applied in the field of vehicle platoon scheduling [155]. Under the condition of limited communication

resources, the use of dynamic event-triggered scheduling and pla￾toon control co-design can effectively save the communication bandwidth to ensure a beneficial tradeoff between robust platoon control performance and communication efficiency [156].

4.5.2. Computing resources Despite its advantages, vehicle intelligence involves many time￾consuming computing tasks. The vehicles in a platoon can transmit computing tasks through the communication network to utilize idle computing resources. Ma et al. [97] developed a price strategy

for edge computing in a vehicle platoon, which uses an RL method. The researchers combined game theory with RL algorithms to iden￾tify a reasonable task flow offloading and recovery scheme among platoon members. The RL method takes the pricing strategy as the action and can complete computing tasks at a lower price than an

iterative algorithm. Table 6 [73,97,106,146] provides a summary of related work on platoon resource allocation.

However, current platoon resource scheduling still has the problem of insufficient versatility, and there is a lack of unified standards and test cases for computing, communication, informa￾tion, and other resources. In the process of resource scheduling, more factors need to be considered, such as lane width, train driv￾ing direction, the long-term impact of scheduling decisions, errors

and delays in perception information, and the overall cost of equip￾ment, communication, and computing. Moreover, with the devel￾opment of 5G and multi-platform communication technologies, resource-scheduling technology can be extended to drones and other collaborative compensation fields, thereby improving the efficiency of all participants in the entire transportation system.

4.6. Platoon projects with a scheduling technique In recent years, with the maturity of autonomous driving tech￾nology, an increasing number of autonomous vehicle platoon pro￾jects have begun practical tests, including EnergyITS [38], Safe Road Trains for the Environment (SARTRE) [157], the GALVP, and the West Well and SAIC MOTOR projects [7], as shown in Fig. 3.

Moreover, some simulation projects have been specifically designed for autonomous vehicle platoons [158–160].

The GALVP project is an autonomous driving platoon project launched in 2020 by Tongji University (China) and Tsinghua University (China). In this project, the leader vehicle in the platoon is manned, and the following vehicles realize low-cost unmanned

driving. This project will be applied to mine truck operations in the future, and it will be necessary to schedule mine muck trans￾portation. The GCDC competition [161–163] focuses on testing the communication and collaboration capabilities between pla￾toons. It includes two scheduling and planning scenarios, such as a platoon-merging scenario and an intersections-passing scenario.

Companion [164] is another practical application project focusing on vehicle platoon scheduling and planning techniques. The pla￾toon system of autonomous vehicles is divided into three layers:

the strategic layer, tactical layer, and operational layer. The strate￾gic level is the top level of strategic planning, including transporta￾tion planning and route optimization. It assigns cargo transportation tasks to trucks and assigns them routes that can form vehicle platoons. After the strategic layer outputs a rough speed profile for each vehicle, the tactical layer is responsible for

detailed velocity planning while considering the dynamics of each vehicle. The operating layer includes the control of the platoon and the control of the vehicle itself. The platoon controller is a dis￾tributed one that is responsible for maintaining the correct dis￾tance between vehicles, performing merging actions, and ensuring platoon stability. The vehicle controller is an internal con￾trol loop for operation control. It controls the speed of the vehicle

according to the platoon controller, other advanced driver￾assistance systems (ADASs), and the driver’s input. Most of the project application scenarios mentioned above are freeway or arterial scenarios; however, container terminals are another promising application scenario for platoon scheduling

technology. A new concept has been proposed of an automated container transportation system between an inland port and ter￾minals (ACTIPOT), which uses automated trucks to transfer con￾tainers between inland ports and container terminals [165].

Microscopic simulation models have been built to demonstrate the overall performance of the ACTIPOT system. In the port of Rotterdam, the Netherlands, the formation of platoons allows vehicles to directly meet the demand points of the inland dry port

[166]. The experimental results show that the use of vehicle platoons in the port of Rotterdam does indeed hold great potential to reduce costs, dwell time, and emissions. At present, automated trucks are being used to solve the problem of container transship￾ment scheduling between the two seaport terminals in the port of

Singapore [167]. Autonomous trucks can be transported in platoons with short inter-vehicle distances, and the following vehicles in the platoon can save on fuel consumption due to reduced air resistance. In this problem, a mixed-integer second￾order cone programming (MISOCP) model is built to minimize

the total running cost. Table 6 A summary of existing studies on platoon resource allocation.

Controlled variable Evaluation index Method Compared method Platform Ref. Sub-channel allocation scheme and power control mechanism Communication delay, interference,

and transmission power Cellular network and E-MBMS-based method Resource allocation scheme

based on D2D unicast Not mentioned Peng et al. [146]

Wireless resource-allocation scheme Tracking error and stability Bipartite graph matching and heuristic gradient descent

Platoon string stability control ignoring radio resources 3GPP Mei et al. [73] Communication resource

allocation Message transmission time and V2V throughput C-RL and Q-table Distributed resource selection

scheme Matlab Sharma and Singh [106] Pricing strategy and computing

resource allocation Immediate utility RL and game theory Interation algorithm Not mentioned Ma et al. [97]

3GPP: third generation partnership project. J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 39

Although the main research and application field of platoon technology focuses on heavy-duty truck transportation, related research on platoon technology for passenger vehicles has also been carried out [168]. At present, passenger vehicle platooning

mainly involves bus platooning or modular rail transit systems. As an early prototype of a bus platooning system, the problem of multi-model bus fleet scheduling has been widely studied. In bus fleet scheduling tasks, the usual goal is to generate optimal bus

vehicle schedules across multiple vehicle types, thereby reducing passenger waiting time and lowering operating costs [169]. Exist￾ing studies have used the transportation network method to carry out the multi-objective optimization of passenger waiting time and vehicle occupancy level [170]. The least-cost network traffic model

can take advantage of Pareto efficient schedules, thereby reducing overall fleet size and operating cost [171]. In addition, it is possible to switch a bus fleet’s flexible routes or fixed routes to reduce costs by building a market entry and exit real option model with an

average return demand density [172]. By directly establishing an integer nonlinear programming model and using DP to solve it, it is possible to balance operating costs and customer waiting time by scheduling different types of buses [173].

Later, when the concept of modular transportation emerged, actual bus platooning began to take shape. Joint design of the dis￾patch interval and vehicle capacity of a modular bus platooning system was carried out under overloaded traffic conditions [174].

Similar to the fleet size design, a bus platooning system can be modeled as a MILP model and solved with DP [175]. In addition, bus platooning scheduling problems modeled as MILP models can be solved using advanced commercial solvers such as Gurobi

[176]. The flexible route design problem also exists in a modular transportation bus platooning system, and can be solved by means of a two-stage solution using DP and heuristics [177]. With the gradual deepening of the research on modular transportation bus

platooning, the concept of a transportation corridor based on mod￾ular autonomous vehicles was proposed [178]. Inbound and out￾bound strategies for modular autonomous vehicles were studied, and the theoretical properties of a passenger boarding sequence and a minimum dispatch interval were given.

However, most current bus platooning system experiments are carried out through small-scale data simulations. In the future, large-scale tests in real environments will be able to ver￾ify the generalization performance of the scheduling algorithm and its sensitivity to environmental parameters. In order to con￾duct large-scale experiments in a real-world environment, more

complex factors in real-world tasks must be considered, such as the randomness of driving speed due to traffic conditions, capac￾ity requirements for emergency situations, changes in demand on different workdays, and dynamic connectivity strategies for modular vehicles. Moreover, in the real world, a wider range

of joint scheduling can be carried out, such as the joint schedul￾ing of multiple bus lines in multiple regions, the joint scheduling of bus vehicles and drivers, and fleet size management schedul￾ing. The scheduling algorithm proposed for a bus platooning sys￾tem can also be applied to other train-based transportation systems, such as subways, high-speed rail, and other forms of modular autonomous driving. In terms of algorithms, paralleliza￾tion or approximation can be considered to improve the compu￾tational efficiency of DP; or, a more efficient method can be used

to jointly design algorithms to replace DP. Compared with a truck platoon, a passenger vehicle platoon has higher requirements for comfort, safety, and efficiency. Passenger comfort considerations include both lateral comfort and longitudi￾nal comfort. In the lateral dispatching process of a passenger vehi￾cle platoon, the influence of lateral acceleration on passenger

comfort must be considered in situations such as the entry of vehi￾cles at the gate [179], the lateral merging of the platoon [69], and lane changes by the platoon [180]. Passenger safety has been eval￾uated during the emergency braking of a passenger vehicle platoon [181]. Moreover, when a passenger vehicle platoon is passing through a traffic intersection, traffic signal control can optimize

safety for private cars and public transport vehilcles [182]. Finally, reducing the waiting time of passengers in order to improve the efficiency of public transportation is another key point in the development of passenger vehicle platoon technology. In addition

to adjusting the timing of traffic lights to allow a passenger vehicle platoon to pass through a traffic intersection quickly [182], dynamic optimization of bus platoon scheduling can reduce the waiting time of passengers at the stations [183].

In short, it can be seen that the performance of scheduling and planning algorithms is gradually improving in various scenarios.

Application research on platoon scheduling and planning has grad￾ually shifted in focus from single agents to multiple agents, from a static environment to dynamic environments, and from a single goal to multiple goals. In the process of algorithm evaluation, var￾ious platoon-related simulation platforms and datasets are used, which are summarized in the next section.

5. Simulation platforms and datasets Since platoon technology is not yet fully mature, there are risks in conducting experiments directly on real roads; thus, there are relatively few related experiments. Instead, many experiments rely

on simulation environments and datasets for testing. The use of simulation environments and datasets are currently the two main verification methods. In a simulation environment, the interactions between the agent and the environment may be more accurate,

whereas a dataset has better authenticity. 5.1. Simulation platforms A simulation platform not only provides a test environment for various algorithms but also provides predictive models for model￾based methods and a training environment for RL methods. There￾fore, a realistic and efficient simulation platform is of great impor￾tance. Although some reviews have included content on simulation

platforms [23,24,33], this paper provides a more comprehensive and concise summary of research on simulation platforms for pla￾toon scheduling and planning, including works with a focus on traffic, vehicles, networks, and integrated simulation platforms, as shown in Fig. 10. The application of each simulation platform

in the field of platoon scheduling and planning is also summarized. 5.1.1. Traffic-simulation platforms Types of traffic-simulation platforms include macroscopic traf￾fic simulation, mesoscopic traffic simulation, and microscopic traffic-simulation. In the scheduling and planning of vehicle pla￾toons, it is necessary to consider the complex interaction between

vehicles; therefore, microscopic or mesoscopic simulation plat￾forms are usually used, such as SUMO, VISSIM, and CORSIM.  SUMO [29] is an open-source, microscale, multi-model traffic￾simulation software. The SUMO simulation platform finely simulates the travel route of each vehicle from a microscopic perspective and gathers the vehicles into a traffic flow for traf￾fic demand analysis. Since SUMO is an open-source software

and supports the Linux system, it is convenient for secondary development. In addition, users can set parameters such as random route selection, random follow-up mode, and random departure time to improve the randomness of the simulation.

Currently, SUMO is mainly used to conduct microscopic traffic simulations in order to verify platoon formation and lane￾changing techniques [49,50,72,92,184].

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 40

 VISSIM [31] is microscopic traffic-simulation software like SUMO, but it has a more intuitive graphical user interface (GUI), which is convenient for users to configure roads, cars, and buses. Therefore, VISSIM software is widely used to evalu￾ate urban traffic planning and engineering design. VISSIM has

abundant research materials for learning, calibration, and application, and it is convenient in application. VISSIM simula￾tion results are accurate, but there are obvious shortcomings in terms of extended applications. The disadvantage of VISSIM is that the road network generation process is cumbersome. VIS￾SIM is also suitable for controlling traffic lights at intersections

for vehicle platoon microscopic traffic simulation [47,63,72].  Traffic software integrated system (TSIS)/CORSIM [30] can simulate complex geometric conditions, different traffic phe￾nomena, different types of traffic control, and management and operations; it can also explain the interaction between

different components of a road network and has an interface with external control logic and programs. TSIS/CORSIM has relatively few functions, but it is a completely open-source software, which helps scientific researchers and developers

to carry out bottom-level learning and research work.  Parallel microscopic simulation (Paramics) [185] has features such as detailed road network modeling, flexible signal and vehicle control, perfect path guidance, a rich programming

interface, and detailed data analysis. Paramics can simulate traffic signals, ramp control, detectors, variable information boards, in-car information display devices, in-car information consultants, route guidance, and more. Paramics is more

prominent in application, and provides a wealth of application programming interface (API) for external applications. It can be used to simulate the collaborative control between platoon vehicles [186].

 The Polaris [112] framework is designed to solve the problem of the lack of interoperable models in the field of transporta￾tion simulation. It is used to implement prototype integration requirements, network supply, and operational feature mod￾els. In addition, it is a function-based full-featured agent￾based simulation model, including travel requirements, traffic simulation, and basic intelligent transportation system (ITS)

operations. It can be extended into a tool suitable for planning purposes, which has been achieved through continuous model development and extensive calibration and verification work; thus, this framework is widely used to simulate platoon for￾mation at the map level [70].

 Synchro plus SimTraffic [187] is a powerful urban traffic￾modeling and drawing tool. SimTraffic can improve a city’s transportation network and measure the derivation, road dis￾tribution, and scientificity of each road to help city builders develop a scientific and effective transportation road network.

It has an interface with traditional popular traffic-simulation software, which is easy to understand and has high practical value for engineering.

 TransModeler [188] is a traffic-simulation model based on a geographic information system, which provides the most effective solution for many traffic-planning and simulation￾modeling tasks. It uses advanced driving behavior models to simulate the traffic flow phenomenon on a road network

and achieves a unique breakthrough in reproducing complex traffic fluids in a state of increasing traffic through simulation.

5.1.2. Network simulation platforms A network simulator can simulate the information interaction and communication process between platoon vehicles. Commonly used softwares include NS-2, NS-3, and OMNET++.

 NS-3 [28] is a discrete-event network simulator for Internet systems. It provides a model of packet data network and execution, and provides users with a simulation engine for simulation experiments. As an open-source software, NS-3

has good scalability, and users can develop it in C++ or Python. It can be used for platoon V2V communication sim￾ulation [184,189].

 OMNET++ [120] is another free and open-source multi￾protocol network simulation software that is of great signifi￾cance in the field of network simulation [190]. It is simple and intuitive when used to create network topologies, due to its integrated development environment (IDE) and GUI. The source code of OMNET++ is based on C++, and developers

can use its defined network description (NED) language to Fig. 10. Traffic, network, and integrated simulation platforms. The traffic simulation environment is responsible for generating the traffic movement of vehicles and pedestrians, while the network simulation environment is responsible for the communication topology and information transmission. An integrated simulation platform is composed of a traffic simulation platform and a network simulation platform. TSIS: traffic software integrated system.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 41

build and simulate network modules. OMNET++ network com￾munication simulation has been used for the formation and lane-changing process of vehicle platoons [50,191].

5.1.3. Integrated simulation platforms With the continuous deepening of platoon research, integrated simulation platforms have begun to appear in order to carry out professional platoon traffic simulation and communication simula￾tion at the same time.

 iTETRIS [192] integrates the wireless communication platform NS-3 and the road traffic-simulation platform SUMO in an environment that is easily tailored to specific situations, so that a performance analysis of collaborative ITS can be per￾formed at the city level. iTETRIS uses the accuracy and scale

of the simulation to clearly reveal the impact of traffic engi￾neering on urban road traffic efficiency, operational strategies, and communication interoperability.

 Veins [193] includes a comprehensive set of models that can simultaneously ensure simulation accuracy and real-time computing. The Veins framework is composed of OMNET++ and SUMO—both of which have a good GUI and IDE for easy

development—and has been applied to vehicle platoon micro￾scopic traffic simulation [194].  VENTOS [50] is an open-source integrated VANET C++ and SUMO simulator used to study vehicle traffic, cooperative driv￾ing, and vehicle-infrastructure interaction by enabling the wireless communication capabilities of dedicated short-range

communications (DSRC). VENTOS can help researchers in the fields of transportation engineering, control theory, and vehicle networks, and VENTOS-based simulation can simulate vehicle platoon formation and lane-changing behavior [50].

5.2. Datasets Although there are numerous simulation platforms that can simulate the traffic, vehicle, and network conditions of a platoon, real-world datasets are still indispensable to verify the perfor￾mance of an algorithm in the real environment. However, since

the platoon technique has not yet been widely popularized, pure platoon datasets are scarce, and most platoon-related research uses other traffic datasets as an alternative. Numerous researchers have constructed and utilized platoon-related datasets to carry out

a great deal of significant research; we introduce these studies from the United States, Europe, and Asia, according to the regions where the datasets were recorded. Platoon-related datasets are summarized in Table 7 [42,62,71,100,108,195–199].

Table 7 Platoon-related dataset reviews.

Dataset name Country/city Main content Details Usage NGSIM United States Vehicle trajectory data Equipment: digital camera Data frequency: 10 Hz Data size: 11.8 million, 25 columns

Generating NGSIM supersaturated highway traffic flow model [195] Houston platoon scattered

dataset Houston, USA Vehicle platoon scattered process data Data accuracy: 15 points per road

Road width: six lanes Road length: 320 and 560 m Road congestion: relatively heavy Statistical results: average link travel times of the

two links are 23.66 and 40.50 s Verifying the vehicle emission dispersion process [196] German road

network data Germany Highway network graphics Data size: 647 nodes and 1390 edges Generating random driving tasks [42] Berlin traffic flow dataset

Berlin, Germany Traffic density demand Does not specifically target each edge, but is based on the travel set of neighboring areas

Verifying platoon formation algorithm effectiveness under complex traffic flow density [197] Swiss highway

truck speed dataset Basel, Switzerland

Truck speed Time: two days, off-peak period Equipment: two radars Statistics: average speed is about 70 kmh1 Comparing the performance of

platoon formation algorithms [100,108] Swedish vehicle platoon￾merging

dataset Southwest of Stockholm, Sweden

 Data related to the merging pro￾cess of two trucks under chang￾ing traffic conditions  Vehicles passing in a 1 min inter￾val and the harmonic average speed of each lane Time: November 2015

Road: 11 km, three lanes, slope Equipment: radars, cameras, and GPS devices; doppler radar installed on the expressway Maximum flow: 2100 vehh1

lane1 Average speed: 95 kmh1 Verifying whether a vehicle platoon can be formed under different traffic

flow densities [62] Swedish vehicle platoon simulation

dataset Sweden Data from two Scania HDV simulation models Vehicle: HDV with a 6  2 configuration and a 480 hp

engine with a 12 speed gearbox Model: Scania’s validated simulation model Road: 280 km, moderate slope Statistical results: average air resistance of platoon is

reduced by 8.4% Comparing the fuel consumption saving performance of the platoon formation algorithm [71]

Beijing ANPR dataset Beijing, China ANPR vehicle information data Time: December, 2012 Acquisition equipment: 1040 cameras

Data size: 54 316 820 ANPR data records and 4 669 229 vehicles Used to discover companion patterns

[198] New Delhi platoon scattered

dataset New Delhi, India Vehicle platoon scattered process

data Road length: 1.6 and 0.7 km Road width: four independent lanes Signal light situation: a period length of 200 s

Collection accuracy: five data collection points are marked at distances of 100, 200, 350, 400, and 450 m from the parking line Equipment: video camera, record traffic activities

and vehicle speed Verifying the vehicle emission dispersion process [199] NGSIM: next-generation simulation; ANPR: automatic number plate recognition; GPS: Global Positioning System; vehh1

lane1 : the number of vehicles passing through each lane per hour.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 42

5.2.1. The United States The United States is one of the first countries to carry out research on platooning technology, so some of the early, well￾known datasets were recorded in the United States. The well￾known dataset in the transportation field, next-generation simula￾tion (NGSIM) [200], was recorded in California and Georgia, USA, and is now used to study the impact of the platoon technique on

traffic flow [195]. In addition, Yu [196] collected vehicle trajectory data near a traffic intersection to calibrate the proposed platoon dispersion models.

5.2.2. Europe Europe followed the United States in platooning studies, with Germany, Sweden, and Switzerland as representatives. The Europe Flagship Program helps numerous universities and businesses con￾duct extensive research. A dataset of randomly generated driving

tasks using German highway network graphics was produced to verify the fuel-saving performance of a vehicle platoon formation algorithm [42]. It was found that the more vehicles there are in a network, the easier it is to form a vehicle platoon to save fuel. By

collecting the speed of trucks on real highways, Saeednia and Menendez [100,108] constructed an optimization problem of vehi￾cle platoon formation. Two real vehicles have also been used to perform platoon merging on a highway, forming a dataset for test￾ing the impact of different traffic flow densities on platoon forma￾tion [62]. Sebe and Müller [197] used real urban road network data and background traffic density models to simulate the platoon for￾mation process in order to verify the performance of their algo￾rithm. Based on Scania’s simulation model, Liang et al. [71]

simulated platoon driving 280 km on a Swedish highway to obtain simulation data and verify that the average air resistance is reduced by 8.4% when vehicles drive in a platoon.

5.2.3. Asia In the past two years, countries in Asia have also attempted to launch datasets for their own road conditions. Compared with Europe and the United States, which have accumulated decades of

technical reserves, Asian countries started their development later. However, the technical solutions obtained by different nations are surprisingly similar, as all rely on expensive active-sensing sensors.

Automatic number plate recognition (ANPR) data recorded in Beijing has been used to discover companion patterns [198], and Saha et al. [199] used a dataset recorded in New Delhi, India, to val￾idate their proposed vehicle platoon dispersion prediction model.

In general, the various kinds of traffic-simulation platforms available today are sufficient, allowing adequate simulations of platoon scheduling and planning techniques. There is no doubt that a more realistic and detailed simulation platform will be more

conducive to the efficient evaluation and training of scheduling and planning algorithms. If a dedicated traffic-simulation platform for platoons appears in the future, it will make the experimental environment configuration more convenient. Nevertheless, at pre￾sent, the available datasets are still relatively inadequate—espe￾cially datasets dedicated to platoons. We believe that this

problem can be alleviated as more and more practical platoon pro￾jects are launched. 6. Challenges and discussions Although the scheduling and planning techniques of vehicle platoons have been greatly developed in recent years, there is still

a long way to go before platoon scheduling and planning tech￾niques mature to large-scale applications. Major challenges and future development directions are elaborated in this section.

6.1. Lack of real-vehicle verification on a large scale Although some autonomous vehicle platoon projects have begun testing on real-world roads in recent years, they are still far from large-scale practical commercial operations. Due to the

lack of large-scale practical operations, existing algorithms do not respond well to real and complex environmental uncertainties, such as traffic jams, accidents, ramps, communication delays, forced driver rests, and uncooperative human drivers. At the same

time, the lack of a large-scale vehicle platoon operation environ￾ment makes it impossible for cargo scheduling and vehicle platoon formation algorithms to be actually verified. Large-scale application scenarios challenge the algorithm’s computational real-time and communication capabilities. At present, there is a lack of a unified

evaluation system for platoon scheduling. Large-scale real-vehicle verification is helpful to the formation of the evaluation system.

The lack of practical vehicle platoon datasets is another current problem. As a result, many vehicle platoon scheduling algorithms can only be verified using general road datasets, which may devi￾ate from actual platoon situations. With the launch of an increasing number of platoon projects and the continuous development of

ITS, the lack of large-scale real-vehicle verification of platoon tech￾nology is expected to be resolved. 6.2. Communication challenges in practical scheduling At present, most of the existing platoon scheduling studies do not take practical communication problems into account; rather,

they assume that all vehicles can achieve perfect communication without delay, error, and bandwidth limit, so as to carry out cen￾tralized scheduling. In practice, however, due to communication delays, vehicles cannot execute scheduling instructions immedi￾ately and may reject the scheduling instruction. Moreover, due to the lack of communication capacity, it is necessary to consider sit￾uations involving mixed driving between network-connected vehi￾cles and conventional vehicles. Security and privacy issues must

also be considered when developing practical communication pro￾cesses, and future platoon scheduling research needs to take the various issues that may affect communication processes into account. One possible way to deal with communication delays is to adopt distributed control, in which vehicles make decisions that

are in both their own interest and the overall interest. Furthermore, it is challenging to handle highly dynamic com￾munication channels and network topology while providing diverse services with stringent quality-of-service (QoS) require￾ments in real time. Therefore, AI-based engineering solutions are needed to achieve efficient network slicing, mobility management,

and cooperative content caching and delivery. 6.3. Human–machine interaction patterns in platoons As more and more practical platoon project experiments are being carried out, human–machine interaction problems in pla￾toon systems are beginning to appear. Unlike self-driving vehicles,

in which the driver can take over alone at any time, a human driver cannot take over a platoon system at any time, because it is diffi￾cult for a human to maintain a very close distance at high speeds, as is done in a platoon system. Manual driving is not as accurate as automatic driving in terms of distance control, so a bad manual

takeover of driving power can easily lead to accidents. Thus, under such circumstances, the driver feels highly stressed. At present, few studies have researched human–machine interactions in pla￾toon driving mode [201]. In the future, emphasis must be put on human–machine interactions in platoon formation, driving, and

emergency separation scenarios [202,203]. J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 43

6.4. Application of learning-based methods In recent years, learning-based algorithms based on deep neural networks and bio-inspired learning networks have attracted wide￾spread attention and research [204]. Since vehicle platoon schedul￾ing and planning are decision-making processes that are easy to model, the RL algorithm is easy to apply and has been widely

adopted. However, the RL algorithm still has some bottlenecks regarding its training efficiency and transferring applications. RL is inefficient when sampling experience in complex observation and motion spaces, so its training time is long. In addition to the

problem of the algorithm itself, a simulation environment for interacting with other drivers lacks authenticity, resulting in RL agents exhibiting poor performance when transferred to the real world. Meanwhile, algorithms based on deep neural networks are

difficult to explain, and it is difficult to trace responsibility in the case of an accident.

In order to improve RL training speed, the experience replay strategy of RL must be improved so that the driving experience generated by time-consuming simulations can be better utilized.

Combining residual RL and multi-expert RL methods with a tradi￾tional rule controller makes it possible to avoid training overfitting and improves the transfer robustness of the agent. More platoon￾specific datasets can also be provided for imitation learning, which can significantly improve the training speed compared with a stan￾dard RL. Finally, significant graphs and other methods can be used to provide a preliminary explanation of the vehicle decision￾making behavior in a platoon.

6.5. Efficient computing resource scheduling With the gradually increasing complexity of scheduling algo￾rithms and a gradual increase in the scale of the vehicle platoon, the amount of calculation required for a vehicle platoon will also gradually increase, causing on-board computing resources to

become increasingly constrained. Existing computing resource￾scheduling methods based on IoV communication must become more efficient in order to meet the real-time requirements of vehi￾cle platoon scheduling and planning. Cabin computing is an emerg￾ing method for scheduling computing resources [205]. It is a network-accessible integrated computing environment for cross￾domain resource configuration and collaboration throughout the entire life cycle of information technology (IT) tasks. Compared

with existing computing modes and technologies, cabin computing possesses the following characteristics: ① It is constructed flexibly in response to the requirements of IT tasks, is scaled and managed in response to the execution of IT tasks, and dies dynamically in

response to the conclusion of IT tasks. ② In the vertical dimension of the full life cycle of IT tasks, it performs the four functions of identifying requirements, allocating resources, executing tasks, and concluding tasks. ③ In the horizontal dimension of the

resources required by IT tasks, cabin computing realizes the overall configuration and coordinated operation of data resources and physical resources. Compared with grid computing, virtual organi￾zation, cloud computing, and edge computing, cabin computing unifies mobility and customization and optimizes and coordinates

cross-domain resources, thereby enabling complex vehicle platoon scheduling and planning algorithms to be calculated efficiently and in real time.

6.6. Distribution of economic benefits With the development of vehicle platoon technology, the dis￾tribution of economic benefits related to vehicle platoons has become increasingly important, yet has not been the subject of extensive research [148]. It is necessary to distribute economic

benefits in a vehicle platoon for a few different reasons. First, the vehicle at the rear of the platoon can save more fuel than the vehicle at the front [206]. Second, in order to form a platoon to save fuel, some vehicles may need to slow down or stop to

wait for vehicles behind them to catch up, which results in a loss of their time. Third, the platoon technique reduces the dis￾tance between cars, thereby improving road capacity, so road managers should consider reducing tolls for platoons. In the future, game theory should be used to design a set of rules so

that the overall solution can be close to the optimum even when all drivers and managers are selfish. It is only in the case of a reasonable distribution of benefits that all stakeholders will be motivated to carry out platoon formation. Furthermore, an

increase in the number of schedulable vehicles creates more space for scheduling, thus resulting in more revenue. Combining various freight companies to form a unified freight scheduling system can bring greater economic benefits.

6.7. The intelligent platoon transportation system Although platoon technology is currently mainly used in the field of truck freight, with the continuous development of the pla￾toon scheduling technique, platoons are expected to be applied to urban passenger transportation systems and to compete with

buses and subways. In city centers, due to road traffic jams and the close distance between stations, buses and subways start and stop repeatedly, resulting in lower average speeds and lower pas￾senger transport efficiency. The core idea of the intelligent platoon transportation system is to realize the point-to-point transporta￾tion of passengers, so it is necessary to split ‘‘trains” into ‘‘pla￾toons.” Passengers with the same boarding and alighting stations

can take the same vehicle; then, the vehicles can form platoons when they drive on the road. When a platoon passes the station, the vehicles that need to stop can separate from the platoon and park, while the other vehicles continue to travel without slowing

down. In this way, the average speed of transport vehicles can be increased while improving transport efficiency.

6.8. Future development of real-world platoon projects As summarized in Section 4.6, a great deal of real-world platoon application project research has been completed, and good plan￾ning and scheduling results have been achieved. These projects will continue to progress in the future, with continuous iterations

and updates. For example, the PATH project will focus on improv￾ing the safety of each vehicle during emergency braking in a pla￾toon in the future [40]. The EnergyITS project will further shorten the distance between vehicles in a platoon, improve equip￾ment reliability, and explore a more mature business operation model [38]. However, as concluded in the GCDC challenge, although each team has implemented the scheduling and planning

functions of a platoon system in the real world, there is a lack of a unified communication protocol and test verification evaluation standards in all systems [161]. This hinders platoon technology from moving toward larger scale practical applications. In addition,

current laws and regulations do not fully support the development of various platoon application projects. In the future, break￾throughs in relevant laws and regulations will be required to enable platoon technology to carry out a wider range of technical verification and application.

7. Conclusions Since platoon scheduling and planning techniques are the key to obtaining the economic benefits of platoons, their develop￾J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 44

ment is crucial to platoons’ large-scale promotion and imple￾mentation. Scheduling and planning techniques for vehicle pla￾toons have been significantly refined over the past decade. Rule-based, model-based, optimization planning, learning-based, and multi-agent platoon scheduling methods have been success￾fully applied to platoon vehicle formation and separation, lateral and longitudinal planning, and resource allocation. However, due

to the lack of large-scale industrial operation, this technology still has a number of flaws. We hope that our review will aid researchers in understanding diverse platoon scheduling and planning techniques and application scenarios, as well as in

advancing the development of a unified and coordinated platoon scheduling and planning system.

A primary future development direction for platoons is to con￾duct more practical road test projects. Based on the road testing of actual vehicles, more platoon-specific datasets can be made avail￾able to researchers. In addition, rapidly evolving neural learning￾based algorithms can use these datasets to learn how to handle complex traffic situations in the real world. Through the continu￾ous efforts of researchers to improve platoon scheduling tech￾niques, it is hoped that the advantages of platoon technology will be fully utilized and this technology will be widely adopted,

thereby transforming the transportation industry and vastly improving transportation efficiency.

## Acknowledgments

This work is funded by the Shanghai Municipal Science and Technology Major Project (2018SHZDZX01) of ZhangJiang Labora￾tory and Shanghai Center for Brain Science and Brain-Inspired Technology, Shanghai Rising Star Program (21QC1400900), and Tongji–Westwell Autonomous Vehicle Joint Lab Project.

Compliance with ethics guidelines Jing Hou, Guang Chen, Jin Huang, Yingjun Qiao, Lu Xiong, Fuxi Wen, Alois Knoll, and Changjun Jiang declare that they have no conflicts of interest or financial conflicts to disclose.

## References

[1] Uhlemann E. Platooning: connected vehicles for safety and efficiency. IEEE Veh Technol Mag 2016;11(3):13–8.

[2] Saleem A, Al Maashri A, Al-Rahbi MA, Awadallah M, Bourdoucen H. Cooperative cruise controller for homogeneous and heterogeneous vehicle platoon system. Int J Automot Technol 2019;20(6):1131–43.

[3] Zhang X, Li W, Guo K, Peng T, Huang Y. Longitudinal acceleration allocation for cooperative adaptive cruise control including platoon kinematics. In:

Proceedings of 2019 IEEE 28th International Symposium on Industrial Electronics (ISIE); 2019 Jun 12–14; Vancouver, BC, Canada. IEEE; 2019. p.

1512–7. [4] SAE. J3016: taxonomy and definitions for terms related to driving automation systems for on-road motor vehicles. Report. New York City: SAE International; 2016.

[5] Wang Z, Wu G, Barth MJ. A review on cooperative adaptive cruise control (CACC) systems: architectures, controls, and applications. In: Proceedings of 2018 21st International Conference on Intelligent Transportation Systems (ITSC); 2018 Nov 4–7; Maui, HI, USA. IEEE; 2018. p. 2884–91.

[6] Sawade O, Radusch I. Survey and classification of cooperative automated driver assistance systems. In: Proceedings of 2015 IEEE 82nd Vehicular Technology Conference (VTC2015-Fall); 2015 Sep 6–9; Boston, MA, USA. IEEE; 2015. p. 1–5.

[7] Li Q, Dai W, Yang Z, Jia Q. Investigation on aerodynamic characteristics of tailing vehicle hood in a two-vehicle platoon. Proc Inst Mech Eng 2020;234 (1):283–99.

[8] Wang Z, Bian Y, Shladover SE, Wu G, Li SE, Barth MJ. A survey on cooperative longitudinal motion control of multiple connected and automated vehicles.

IEEE Intell Transp Syst Mag 2019;12(1):4–24. [9] Li SE, Zheng Y, Li K, Wang LY, Zhang H. Platoon control of connected vehicles from a networked control perspective: literature review, component modeling, and controller synthesis. IEEE Transp Vehicular Technol 2018;1.

[10] Li SE, Zheng Y, Li K, Wu Y, Hedrick JK, Gao F, et al. Dynamical modeling and distributed control of connected and automated vehicles: challenges and opportunities. IEEE Intell Transp Syst Mag 2017;9(3):46–58.

[11] Guanetti J, Kim Y, Borrelli F. Control of connected and automated vehicles: state of the art and future challenges. Annu Rev Contr 2018;45:18–40.

[12] Hou J, Yu J, Qu S, Wang F, Zi Y, Chen G. GA-based velocity planning using jerk as the encoding method for autonomous vehicles. In: Proceedings of 2019 3rd Conference on Vehicle Control and Intelligence (CVCI); 2019 Sep 21–22; Hefei, China. IEEE; 2019. p. 1–6.

[13] Zhang W, Jenelius E, Ma X. Freight transport platoon coordination and departure time scheduling under travel time uncertainty. Transp Res Part E Logist Transp Rev 2017;98:1–23.

[14] Wang H, Wang R, Wu R, Zhu K, Zhang L. IPCS: intersection platoon control scheme for non-traffic light community. In: Proceedings of 2019 IEEE Intelligent Transportation Systems Conference (ITSC); 2019 Oct 27–30; Auckland, New Zealand. IEEE; 2019. p. 3502–7.

[15] Song M, Chen F, Ma X. A simulation of the traffic behavior with autonomous truck platoons based on cellular automaton. In: Proceedings of 2019 5th International Conference on Transportation Information and Safety (ICTIS); 2019 Jul 14–17; Liverpool, UK. IEEE; 2019. p. 416–23.

[16] Chen C, Jiang J, Lv N, Li S. An intelligent path planning scheme of autonomous vehicles platoon using deep reinforcement learning on network edge. IEEE Access 2020;8:99059–69.

[17] Kohler U. Stability of vehicle platoons. Transp Traffic Theory 1974;6:39–55. [18] Feng S, Zhang Y, Li SE, Cao Z, Liu HX, Li L. String stability for vehicular platoon control: definitions and analysis methods. Annu Rev Contr 2019;47:81–97.

[19] Tsugawa S, Jeschke S, Shladover SE. A review of truck platooning projects for energy savings. IEEE Trans on Intell Veh 2016;1(1):68–77.

[20] Mariani S, Cabri G, Zambonelli F. Coordination of autonomous vehicles: taxonomy and survey. ACM Comput Surv 2021;54(1):1–33.

[21] Malik S, Khan MA, El-Sayed H. Collaborative autonomous driving—a survey of solution approaches and future challenges. Sensors 2021;21(11):3783.

[22] Riostorres J, Malikopoulos AA. A survey on the coordination of connected and automated vehicles at intersections and merging at highway on-ramps. IEEE Trans Intell Transp Syst 2017;18(5):1066–77.

[23] Jia D, Lu K, Wang J, Zhang X, Shen X. A survey on platoon-based vehicular cyber–physical systems. IEEE Comm Surv Tutor 2016;18(1):263–84.

[24] Ros FJ, Martinez JA, Ruiz PM. A survey on modeling and simulation of vehicular networks: communications, mobility, and tools. Comput Commun 2014;43:1–15.

[25] Sun X, Yu FR, Zhang P. A survey on cyber-security of connected and autonomous vehicles (CAVs). IEEE Trans Intell Transp Syst 2021;23 (7):6240–59.

[26] Shaaban R, Faruque S. Cyber security vulnerabilities for outdoor vehicular visible light communication in secure platoon network: review, power distribution, and signal to noise ratio analysis. Phys Commun 2020;40:101094.

[27] Ghosal A, Sagong SU, Halder S, Sahabandu K, Conti M, Poovendran R, et al. Truck platoon security: state-of-the-art and road ahead. Comput Netw 2021;185:107658.

[28] Riley GF, Henderson TR. The NS-3 network simulator. Modeling and Tools for Network Simulation. Berlin: Springer; 2010.

[29] Hay RT. SUMO: a history of modification. Mol Cell 2005;18(1):1–12. [30] Halati A, Lieu H, Walker S. CORSIM-corridor traffic simulation model. In:

Proceedings of Traffic Congestion and Traffic Safety in the 21st Century. ASCE; 1997. p. 570–6.

[31] Fellendorf M, Vortisch P. Microscopic traffic flow simulator VISSIM. Fundamentals of traffic simulation. Berlin: Springer; 2010.

[32] Stüdli S, Seron MM, Middleton RH. From vehicular platoons to general networked systems: string stability and related concepts. Annu Rev Contr 2017;44:157–72.

[33] Bevly D, Cao X, Gordon M, Ozbilgin G, Kari D, Nelson B, et al. Lane change and merge maneuvers for connected and automated vehicles: a survey. IEEE Trans Intell Veh 2016;1(1):105–20.

[34] Badnava S, Meskin N, Gastli A, Al-Hitmi M, Ghommam J, Mesbah M, et al. Platoon transitional maneuver control system: a review. IEEE Access 2021;9:88327–47.

[35] Woodman R, Lu K, Higgins MD, Brewerton S, Jennings P, Birrell S. A human factors approach to defining requirements for low-speed autonomous vehicles to enable intelligent platooning. In: Proceedings of 2019 IEEE Intelligent Vehicles Symposium (IV); 2019 Jun 9–12; Paris, France. IEEE;

2019. p. 2371–6. [36] Axelsson J. Safety in vehicle platooning: a systematic literature review. IEEE Trans Intell Transp Syst 2017;18(5):1033–45.

[37] Chen J, Chen H, Gao J, Pattinson JA, Quaranta R. A business model and cost analysis of automated platoon vehicles assisted by the internet of things. Proc Inst Mech Eng 2021;235(2–3):721–31.

[38] Tsugawa S. Results and issues of an automated truck platoon within the energy its project. In: Proceedings of 2014 IEEE Intelligent Vehicles Symposium Proceedings; 2014 Jun 8–11; Dearborn, MI, USA. IEEE; 2014. p.

642–7. [39] Kunze R, Ramakers R, Henning K, Jeschke S. Organization and operation of electronically coupled truck platoons on German motorways. In: Proceedings of Intelligent Robotics and Applications; 2009 Dec 16–18; Singapore,

Singapore. Berlin: Springer; 2009. p. 135–46. J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 45

[40] Nowakowski C, Shladover SE, Lu XY, Thompson D, Kailas A. Cooperative adaptive cruise control (CACC) for truck platooning: operational concept alternatives. Report. Berkeley: University of California; 2015.

[41] Dey K, Yan L, Wang X, Wang Y, Shen H, Chowdhury M, et al. A review of communication, driver characteristics, and controls aspects of cooperative adaptive cruise control (CACC). IEEE Trans Intell Transp Syst 2016;17 (2):491–509.

[42] Larsson E, Sennton G, Larson J. The vehicle platooning problem: computational complexity and heuristics. Transp Res Part C Emerg Technol 2015;60:258–77.

[43] Ma J, Li X, Zhou F, Hu J, Park BB. Parsimonious shooting heuristic for trajectory design of connected automated traffic part II: computational issues and optimization. Transp Res Part B Methodol 2017;95:421–41.

[44] Zhou F, Li X, Ma J. Parsimonious shooting heuristic for trajectory design of connected automated traffic part I: theoretical analysis with generalized time geography. Transp Res Part B Methodol 2017;95:394–420.

[45] Duret A, Wang M, Leclercq L. Truck platooning strategy near merge: Heuristic-based solution and optimality conditions. In: Proceedings of 2018 Transportation Research Board Annual Meeting (TRB); 2018 Jan; Washington, DC, USA.HAL; 2018. p. 1–20.

[46] Heinovski J, Dressler F. Platoon formation: optimized car to platoon assignment strategies and protocols. In: Proceedings of 2018 IEEE Vehicular Networking Conference (VNC); 2018 Dec 5–7; Taipei, China. IEEE; 2018. p. 1–8.

[47] Wang P, Jiang Y, Xiao L, Zhao Y, Li Y. A joint control model for connected vehicle platoon and arterial signal coordination. J Intell Transp Syst 2020;24 (1):81–92.

[48] Liang XJ, Guler SI, Gayah VV. A heuristic method to optimize generic signal phasing and timing plans at signalized intersections using connected vehicle technology. Transp Res Part C Emerg Technol 2020;111:156–70.

[49] Dos Santos TC, Bruno DR, Osório FS, Wolf DF. Evaluation of lane￾merging approaches for connected vehicles. In: Proceedings of 2019 IEEE Intelligent Vehicles Symposium (IV); 2019 Jun 9–12; Paris, France. IEEE; 2019.

p. 1935–9. [50] Amoozadeh M, Deng H, Chuah C, Zhang HM, Ghosal D. Platoon management with cooperative adaptive cruise control enabled by VANET. Veh Commun 2015;2(2):110–23.

[51] Li M, Gao X, Wen Y, Si J, Huang HH. Offline policy iteration based reinforcement learning controller for online robotic knee prosthesis parameter tuning. In: Proceedings of 2019 International Conference on Robotics and Automation (ICRA); 2019 May 20–24; Montreal, QC, Canada.

IEEE; 2019. p. 2831–7. [52] Gu S, Yang L, Du Y, Chen G, Walter F, Wang J, et al. A review of safe reinforcement learning: methods, theory and applications. 2022.

ArXiv:2205.10330. [53] Guan J, Chen G, Huang J, Li Z, Xiong L, Hou J, et al. A discrete soft actor-critic decision-making strategy with sample filter for freeway autonomous driving.

IEEE Trans Vehicular Technol 2022;72(2):2593–8. [54] Zhang R, Hou J, Chen G, Li Z, Chen J, Knoll A. Residual policy learning facilitates efficient model-free autonomous racing. IEEE Robot Autom Lett 2022;7(4):11625–32.

[55] Semsar-Kazerooni E, Verhaegh J, Ploeg J, Alirezaei M. Cooperative adaptive cruise control: an artificial potential field approach. In: Proceedings of 2016 IEEE Intelligent Vehicles Symposium (IV); 2016 Jun 19–22; Gothenburg, Sweden. IEEE; 2016. p. 361–7.

[56] Semsar-Kazerooni E, Elferink K, Ploeg J, Nijmeijer H. Multi-objective platoon maneuvering using artificial potential fields. IFAC PapersOnLine 2017;50 (1):15006–11.

[57] Gao K, Yan D, Yang F, Xie J, Liu L, Du R, et al. Conditional artificial potential field-based autonomous vehicle safety control with interference of lane changing in mixed traffic scenario. Sensors 2019;19(19):4199.

[58] McCrone DJ, Arasteh E, Jan FM. An artificial potential field approach to simulate cooperative adaptive cruise controlled vehicles. In: Proceedings of Dynamic Systems and Control Conference; 2017 Oct 11–13; Tysons, VA, USA.

ASME; 2017. p. 58271. [59] Huang Z, Chu D, Wu C, He Y. Path planning and cooperative control for automated vehicle platoon using hybrid automata. IEEE Trans Intell Transp Syst 2018;20(3):959–74.

[60] Yu J, Hou J, Chen G. Improved safety-first A-star algorithm for autonomous vehicles. In: Proceedings of 2020 5th International Conference on Advanced Robotics and Mechatronics (ICARM); 2020 Dec 18–21; Shenzhen, China. IEEE; 2020. p. 706–10.

[61] Mohamed A, Ren J, Lang H, El-Gindy M. Optimal collision free path planning for an autonomous articulated vehicle with two trailers. In: Proceedings of 2017 IEEE International Conference on Industrial Technology (ICIT); 2017 Mar 22–25; Toronto, ON, Canada. IEEE; 2017. p. 860–5.

[62] Liang K, De Hoef SV, Terelius H, Turri V, Besselink B, Martensson J, et al. Networked control challenges in collaborative road freight transport. Eur J Control 2016;30:2–14.

[63] Ye Q, Chen X, Liao R, Yu L. Development and evaluation of a vehicle platoon guidance strategy at signalized intersections considering fuel savings. Transp Res Part D Transp Environ 2019;77:120–31.

[64] Liu M, Wang M, Hoogendoorn S. Optimal platoon trajectory planning approach at arterials. Transp Res Rec 2019;2673(9):214–26.

[65] Huang Z, Chu D, Wu C, He Y. Path planning and cooperative control for automated vehicle platoon using hybrid automata. IEEE Trans Intell Transp Syst 2019;20(3):959–74.

[66] An G, Talebpour A. Lane-changing trajectory optimization to minimize traffic flow disturbance in a connected automated driving environment. In:

Proceedings of 2019 IEEE Intelligent Transportation Systems Conference (ITSC); 2019 Oct 27–30; Auckland, New Zealand. IEEE; 2019. p. 1794–9.

[67] Baskar LD, De Schutter B, Hellendoorn H. Optimal routing for automated highway systems. Transp Res Part C Emerg Technol 2013;30:1–22.

[68] Goli M, Eskandarian A. MPC-based lateral controller with look-ahead design for autonomous multi-vehicle merging into platoon. In: Proceedings of 2019 American Control Conference (ACC); 2019 Jul 10–12; Philadelphia, PA, USA.

IEEE; 2019. p. 5284–91. [69] Liu H, Zhuang W, Yin G, Tang Z, Xu L. Strategy for heterogeneous vehicular platoons merging in automated highway system. In: Proceedings of 2018 Chinese Control and Decision Conference (CCDC); 2018 Jun 9–11; Shenyang,

China. IEEE; 2018. p. 2736–40. [70] Sokolov V, Larson J, Munson T, Auld J, Karbowski D. Maximization of platoon formation through centralized routing and departure time coordination.

Transp Res Rec 2017;2667(1):10–6. [71] Liang KY, Mårtensson J, Johansson KH. Heavy-duty vehicle platoon formation for fuel efficiency. IEEE Trans Intell Transp Syst 2015;17(4):1051–61.

[72] Timmerman RW, Boon MAA. Platoon forming algorithms for intelligent street intersections. Transp A Transp Sci 2019;17(3):278–307.

[73] Mei J, Zheng K, Zhao L, Lei L, Wang X. Joint radio resource allocation and control for vehicle platooning in ITE-V2V network. IEEE Trans Vehicular Technol 2018;67(12):12218–30.

[74] Chen G, Hou J, Dong J, Li Z, Gu S, Zhang B, et al. Multiobjective scheduling strategy with genetic algorithm and time-enhanced A* planning for autonomous parking robotics in high-density unmanned parking lots. IEEE/ ASME Trans Mechatron 2020;26(3):1547–57.

[75] Ding S, Chen X, Yu L, Wang X. Arterial offset optimization considering the delay and emission of platoon: a case study in Beijing. Sustainability 2019;11 (14):3882.

[76] Valdés F, Iglesias R, Espinosa F, Rodríguez MA. An efficient algorithm for optimal routing applied to convoy merging manoeuvres in urban environments. Appl Intell 2012;37(2):267–79.

[77] Johansson I, Jin J, Ma X, Pettersson H. Look-ahead speed planning for heavy￾duty vehicle platoons using traffic information. Transp Res Procedia 2017;22:561–9.

[78] Odekunle A, Gao W, Anayor C, Wang X, Chen Y. Predictive cruise control of connected and autonomous vehicles: an adaptive dynamic programming approach. In: Proceedings of SoutheastCon 2018; 2018 Apr 19–22; St.

Petersburg, FL, USA. IEEE; 2018. p. 1–6. [79] Chen J, Sun J. Platoon separation strategy optimization method based on deep cognition of a driver’s behavior at signalized intersections. IEEE Access 2020;8:17779–91.

[80] Gao W, Jiang ZP, Ozbay K. Data-driven adaptive optimal control of connected vehicles. IEEE Trans Intell Transp Syst 2016;18(5):1122–33.

[81] Huang M, Gao W, Wang Y, Jiang ZP. Data-driven shared steering control of semi-autonomous vehicles. IEEE Trans Hum Mach Syst 2019;49(4):350–61.

[82] Lan J, Zhao D, Tian D. Data-driven robust predictive control for mixed vehicle platoons using noisy measurement. IEEE Trans Intell Transp Syst 2021:1–11.

[83] Zhang T, Zou Y, Zhang X, Guo N, Wang W. Data-driven based cruise control of connected and automated vehicles under cyber–physical system framework.

IEEE Trans Intell Transp Syst 2020;22(10):6307–19. [84] Guo J, Guo H, Liu J, Cao D, Chen H. Distributed data-driven predictive control for hybrid connected vehicle platoons with guaranteed robustness and string stability. IEEE Internet Things J 2022;9(17):16308–21.

[85] Zhan J, Ma Z, Zhang L. Data-driven modeling and distributed predictive control of mixed vehicle platoons. IEEE Trans Intell Veh 2022;8(1):572–82.

[86] Parsa AB, Shabanpour R, Mohammadian A, Auld J, Stephens T. A data-driven approach to characterize the impact of connected and autonomous vehicles on traffic flow. Transp Lett 2021;13(10):687–95.

[87] Gettman D, Shelby SG, Head L, Bullock DM, Soyke N. Data-driven algorithms for real-time adaptive tuning of offsets in coordinated traffic signal systems.

Transp Res Rec 2007;2035(1):1–9. [88] Jaffar F, Farid T, Sajid M, Ayaz Y, Khan MJ. Prediction of drag force on vehicles in a platoon configuration using machine learning. IEEE Access 2020;8:201823–34.

[89] Buechel M, Knoll A. Deep reinforcement learning for predictive longitudinal control of automated vehicles. In: Proceedings of 2018 21st International Conference on Intelligent Transportation Systems ITSC; 2018 Nov 4–7; Maui, HI, USA. IEEE; 2018. p. 2391–7.

[90] Feng Y, He D, Guan Y. Composite platoon trajectory planning strategy for intersection throughput maximization. IEEE Trans Vehicular Technol 2019;68 (7):6305–19.

[91] Fan Y, Xiao X, Feng W. An anti-jamming game in VANET platoon with reinforcement learning. In: Proceedings of 2018 IEEE International Conference on Consumer Electronics-Taiwan (ICCE-TW); 2018 May 19–21; Taichung, China. IEEE; 2018. p. 1–2.

[92] Dos Santos TC, Wolf DF. Automated conflict resolution of lane change utilizing probability collectives. In: Proceedings of 19th International Conference on Advanced Robotics (ICAR); 2019 Dec 2–6; Belo Horizonte, Brazil. IEEE; 2019. p. 623–8.

[93] Li B, Zhang Y, Feng Y, Zhang Y, Ge Y, Shao Z. Balancing computation speed and quality: a decentralized motion planning method for cooperative lane changes of connected and automated vehicles. IEEE Trans Intell Veh 2018;3 (3):340–50.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 46

[94] Zhang R, Chen G, Hou J, Li Z, Knoll A. PIPO: policy optimization with permutation-invariant constraint for distributed multi-robot navigation. In:

Proceedings of 2022 IEEE International Conference on Multisensor Fusion and Integration for Intelligent Systems (MFI); 2022 Sep 20–22; Bedford, UK. IEEE; 2022. p. 1–7.

[95] Johansson A, Nekouei E, Johansson KH, Mårtensson J. Multi-fleet platoon matching: a game-theoretic approach. In: Proceedings of 2018 21st International Conference on Intelligent Transportation Systems (ITSC); 2018 Nov 4–7; Maui, HI, USA. IEEE; 2018. p. 2980–5.

[96] Liu Y, Zong C, Han X, Zhang D, Zheng H, Shi C. Spacing allocation method for vehicular platoon: a cooperative game theory approach. Appl Sci 2020;10 (16):5589.

[97] Ma X, Zhao J, Li Q, Gong Y. Reinforcement learning based task offloading and take-back in vehicle platoon networks. In: Proceedings of 2019 IEEE International Conference on Communications Workshops (ICC Workshops); 2019 May 20–24; Shanghai, China. IEEE; 2019. p. 1–6.

[98] Lobato W, Rosario D, Gerla M, Villas LA. Platoon-based driving protocol based on game theory for multimedia transmission over VANET. In: Proceedings of 2017 IEEE Global Communications Conference; 2017 Dec 4–8; Singapore, Singapore. IEEE; 2017. p. 1–6.

[99] Gu S, Chen G, Zhang L, Hou J, Hu Y, Knoll A. Constrained reinforcement learning for vehicle motion planning with topological reachability analysis.

Robotics 2022;11(4):81. [100] Saeednia M, Menendez M. A consensus-based algorithm for truck platooning.

IEEE Trans Intell Transp Syst 2016;18(2):404–15. [101] Wang W, Wang C, Guo Y, Luo X, Gao Y. Self-triggered consensus of vehicle platoon system with time-varying topology. Front Neurorobot 2020;14:53.

[102] Yang P, Tang Y, Yan M, Zhu X. Consensus based control algorithm for nonlinear vehicle platoons in the presence of time delay. Int J Control Autom Syst 2019;17(3):752–64.

[103] Wu J, Wang Y, Wang L, Shen Z, Yin C. Consensus-based platoon forming for connected autonomous vehicles. IFAC PapersOnLine 2018;51(31):801–6.

[104] Yu S, Fu R, Guo Y, Xin Q, Shi Z. Consensus and optimal speed advisory model for mixed traffic at an isolated signalized intersection. Phys A 2019;531:121789.

[105] Khamis MA, Gomaa W. Enhanced multiagent multi-objective reinforcement learning for urban traffic light control. In: Proceedings of 2012 11th International Conference on Machine Learning and Applications; 2012 Dec 12–15; Boca Raton, FL, USA. IEEE; 2012. p. 586–91.

[106] Sharma S, Singh B. Cooperative reinforcement learning based adaptive resource allocation in V2V communication. In: Proceedings of 2019 6th International Conference on Signal Processing and Integrated Networks (SPIN); 2019 Mar 7–8; Noida, India. IEEE; 2019. p. 489–94.

[107] Elbert R, Knigge JK, Friedrich A. Analysis of decentral platoon planning possibilities in road freight transport using an agent-based simulation model.

J Simul 2020;14(1):64–75. [108] Saeednia M, Menendez M. Analysis of strategies for truck platooning: hybrid strategy. Transp Res Rec 2016;2547(2547):41–8.

[109] Johansson A, Mårtensson J. Game theoretic models for profit-sharing in multi-fleet platoons. In: Proceedings of 2019 IEEE Intelligent Transportation Systems Conference (ITSC); 2019 Oct 27–30; Auckland, New Zealand. IEEE; 2019. p. 3019–24.

[110] Wu J, Ahn S, Zhou Y, Liu P, Qu X. The cooperative sorting strategy for connected and automated vehicle platoons. Transp Res Part C Emerg Technol 2021;123:102986.

[111] Lee WJ, Kwag SI, Ko YD. The optimal eco-friendly platoon formation strategy for a heterogeneous fleet of vehicles. Transp Res Part D Transp Environ 2021;90:102664.

[112] Auld J, Hope M, Ley H, Sokolov V, Xu B, Zhang K. Polaris: agent-based modeling framework development and implementation for integrated travel demand and network and operations simulations. Transp Res Part C Emerg Technol 2016;64:101–16.

[113] Hasrouny H, Samhat AE, Bassil C, Laouiti A. VANET security challenges and solutions: a survey. Veh Commun 2017;7:7–20.

[114] Huang Z, Zhuang W, Yin G, Xu L, Luo K. Cooperative merging for multiple connected and automated vehicles at highway on-ramps via virtual platoon formation. In: Proceedings of 2019 Chinese Control Conference (CCC); 2019 Jul 27–30; Guangzhou, China. IEEE; 2019. p. 6709–14.

[115] Hao P, Wang Z, Wu G, Boriboonsomsin K, Barth M. Intra-platoon vehicle sequence optimization for ecocooperative adaptive cruise control. In:

Proceedings of 2017 IEEE 20th International Conference on Intelligent Transportation Systems (ITSC); 2017 Oct 16–19; Yokohama, Japan. IEEE; 2017. p. 1–6.

[116] Farag A, Hussein A, Shehata OM, Garcia F, Tadjine HH, Matthes E. Dynamics platooning model and protocols for self-driving vehicles. In: Proceedings of 2019 IEEE Intelligent Vehicles Symposium (IV); 2019 Jun 9–12; Paris, France.

IEEE; 2019. p. 1974–80. [117] Karbalaieali S, Osman OA, Ishak S. A dynamic adaptive algorithm for merging into platoons in connected automated environments. IEEE Trans Intell Transp Syst 2019;21(10):4111–22.

[118] Wang J, Ma F, Yu Y, Zhu S, Gelbal SY, Aksun-Guvenc B, et al. Optimization design of the decentralized multi-vehicle cooperative controller for freeway ramp entrance. Int J Automot Technol 2021;22(3):799–810.

[119] Timmerman R, Boon MA. Platoon forming algorithms for intelligent street intersections. Transp A Transp Sci 2021;17(3):278–307.

[120] Pongor G. OMNET: objective modular network testbed. In: Proceedings of International Workshop on Modeling, Analysis, and Simulation on Computer and Telecommunication Systems; 1993; San Diego, CA, USA. Society for Computer Simulation International; 1993. p. 323–6.

[121] Saeednia M, Menendez M. A consensus-based algorithm for truck platooning. IEEE Trans Intell Transp Syst 2017;18(2):404–15.

[122] Liang KY, Mårtensson J, Johansson KH. Fuel-saving potentials of platooning evaluated through sparse heavy duty vehicle position data. In: Proceedings of 2014 IEEE Intelligent Vehicles Symposium Proceedings; 2014 Jun 8–11; Dearborn, MI, USA. IEEE; 2014. p. 1061–8.

[123] Larson J, Kammer C, Liang KY, Johansson KH. Coordinated route optimization for heavy-duty vehicle platoons. In: Proceedings of 16th International IEEE Conference on Intelligent Transportation Systems (ITSC 2013); 2013 Oct 6–9; The Hague, Netherlands. IEEE; 2013. p. 1196–202.

[124] Van de Hoef S. Fuel-efficient centralized coordination of truck platooning dissertation. Stockholm: KTH Royal Institute of Technology; 2016.

[125] Adler A, Miculescu D, Karaman S. Optimal policies for platooning and ride sharing in autonomy-enabled transportation; In: Proceedings of Algorithmic Foundations of Robotics XII. 2016 Dec 18–20; San Francisco, CA, USA.

Springer; 2020. p. 848–63. [126] Bhoopalam AK, Agatz N, Zuidwijk R. Planning of truck platoons: a literature review and directions for future research. Transp Res Part B Methodol 2018;107:212–28.

[127] Medina AIM, van de Wouw N, Nijmeijer H. Cooperative intersection control based on virtual platooning. IEEE Trans Intell Transp Syst 2017;19 (6):1727–40.

[128] Bashiri M, Jafarzadeh H, Fleming CH. PAIM: platoon-based autonomous intersection management. 2018. ArXiv:1809.06956.

[129] Stebbins S, Hickman M, Kim J, Vu HL. Characterising green light optimal speed advisory trajectories for platoon-based optimisation. Transp Res Part C Emerg Technol 2017;82:43–62.

[130] Bashiri M, Fleming CH. A platoon-based intersection management system for autonomous vehicles. In: Proceedings of 2017 IEEE Intelligent Vehicles Symposium (IV); 2017 Jun 11–14; Los Angeles, CA, USA. IEEE; 2017. p. 667– 72.

[131] Liu B, El Kamel A. V2X-based decentralized cooperative adaptive cruise control in the vicinity of intersections. IEEE Trans Intell Transp Syst 2016;17 (3):644–58.

[132] Gunther HJ, Kleinau S, Trauer O, Wolf L. Platooning at traffic lights. In: Proceedings of Intelligent Vehicles Symposium (IV); 2016 Jun 19–22; Gothenburg, Sweden. IEEE; 2016. p. 1047–53.

[133] Masi S, Xu P, Bonnifait P. Adapting the virtual platooning concept to roundabout crossing. In: Proceedings of 2018 IEEE Intelligent Vehicles Symposium (IV); 2018 Jun 26–30; Changshu, China. IEEE; 2018. p.

1366–72. [134] Wu X, Yang H, Mainali B, Pokharel P, Chiu S. Development of platoon-based actuated signal control systems to coordinated intersections: application in corridors in Houston. IET Intell Transp Syst 2019;14(2):127–37.

[135] Kong X, Wu J, Qu X. An online processing method for the cooperative control of connected and automated vehicle platoons. Smart Transp Syst 2021;133-99.

[136] Namazi H, Taghavipour A. Traffic flow and emissions improvement via vehicle-to-vehicle and vehicle-to-infrastructure communication for an intelligent intersection. Asian J Control 2021;23(5):2328–42.

[137] Wu Y, Hou J, Chen G, Knoll A. Trajectory prediction based on planning method considering collision risk. In: Proceedings of 2020 5th International Conference on Advanced Robotics and Mechatronics (ICARM); 2020 Dec 18– 21; Shenzhen, China. IEEE, 2020. p. 466–70.

[138] Dai G, Wang H, Wang W. Signal optimization and coordination for bus progression based on maxband. KSCE J Civ Eng 2016;20(2):890–8.

[139] Dong Y, Xu Y, Li D, Hu C, Xi Y. Model of platoon evolution in LVM scenario. In: Proceedings of 2019 IEEE Intelligent Transportation Systems Conference (ITSC); 2019 Oct 27–30; Auckland, New Zealand. IEEE; 2019. p.

2932–7. [140] Chen J, ShangGuan W, Cai B, Bhat M, Du Y. Intelligent platoon operating slot optimization method based on drivers’ overtaking behavior. In: Proceedings of 2019 IEEE Intelligent Transportation Systems Conference (ITSC); 2019 Oct

27–30; Auckland, New Zealand. IEEE; 2019. p. 1947–52. [141] Lee S, Oh C, Hong S. Exploring lane change safety issues for manually driven vehicles in vehicle platooning environments. IET Intell Transp Syst 2018;12 (9):1142–7.

[142] Swaroop D, Hedrick JK, Chien C, Ioannou P. A comparision of spacing and headway control laws for automatically controlled vehicles. Veh Syst Dyn 1994;23(1):597–625.

[143] Liang H, Zhou S, Liu X, Zheng F, Hong X, Zhou X, et al. A dynamic resource allocation model based on SMDP and DRL algorithm for truck platoon in vehicle network. IEEE Internet Things J 2021;9(12):10295–305.

[144] Xu R, Li J, Dong X, Yu H, Ma J. Bridging the domain gap for multi-agent perception. 2022. ArXiv:2210.08451.

[145] Araújo F, Serra HP, Rosário D, Cerqueira E. Optimized-selection model of relay nodes in platoon-based vehicular ad-hoc networks. In: Proceedings of the 10th Latin America Networking Conference; 2018 Oct 3–4; São Paulo, Brazil.

ACM; 2018. p. 18–24. [146] Peng H, Li D, Ye Q, Abboud K, Zhao H, Zhuang W, et al. Resource allocation for cellular-based intervehicle communications in autonomous multiplatoons.

IEEE Trans Vehicular Technol 2017;66(12):11249–63. [147] Cao L, Yin H. Resource allocation for vehicle platooning in 5G NR-V2X via deep reinforcement learning. 2021. ArXiv:2101.10424.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 47

[148] Lesch V, Krupitzer C, Stubenrauch K, Keil N, Becker C, Kounev S, et al. A comparison of mechanisms for compensating negative impacts of system integration. Future Gener Comput Syst 2021;116:117–31.

[149] Parvini M, Javan MR, Mokari N, Abbasi B, Jorswieck EA. AOI-aware resource allocation for platoon-based C-V2X networks via multi-agent multi-task reinforcement learning. 2021. ArXiv:2105.04196.

[150] Zheng D, Chen Y, Wei L, Jiao B, Hanzo L. Dynamic NOMA-based computation offloading in vehicular platoons. 2021. ArXiv:2103.17049.

[151] Song H, Ding D, Dong H, Yi X. Distributed filtering based on Cauchy-kernel￾based maximum correntropy subject to randomly occurring cyber-attacks. Automatica 2022;135:110004.

[152] Wang X, Ding D, Ge X, Han QL. Neural-network-based control for discrete￾time nonlinear systems with Denialof-service attack: the adaptive event￾triggered case. Int J Robust Nonlinear Control 2022;32(5):2760–79. [153] Ding D, Han QL, Xiang Y, Ge X, Zhang XM. A survey on security control and attack detection for industrial cyber–physical systems. Neurocomputing 2018;275:1674–83.

[154] Zhang XM, Han QL, Ge X, Ding D, Ding L, Yue D, et al. Networked control systems: a survey of trends and techniques. IEEE/CAA J Automat Sinica 2019;7(1):1–17.

[155] Ge X, Han QL, Wang Z, Ding D. Dynamic event-triggered vehicle platooning control: trade-off between communication efficiency and platoon performance. In: Proceedings of 2021 40th Chinese Control Conference (CCC); 2021 Jul 26–28; Shanghai, China. IEEE; 2021. p. 4883–8.

[156] Ge X, Xiao S, Han QL, Zhang XM, Ding D. Dynamic event-triggered scheduling and platooning control co-design for automated vehicles over vehicular ad￾hoc networks. IEEE/CAA J Automat Sinica 2022;9(1):31–46.

[157] Chan E, Gilhead P, Jelinek P, Krejci P, Robinson T. Cooperative control of Sartre automated platoon vehicles. In: Proceedings of 19th ITS World Congress; 2012 Oct 22–26; Vienna, Austria. America ITS; 2012. p. 22–6.

[158] Deng Q. A general simulation framework for modeling and analysis of heavy-duty vehicle platooning. IEEE Trans Intell Transp Syst 2016;17 (11):3252–62.

[159] Karoui O, Guerfala E, Koubaa A, Khalgui M, Tovard E, Wu N, et al. Performance evaluation of vehicular platoons using Webots. IET Intell Transp Syst 2017;11 (8):441–9.

[160] Tuchner A, Haddad J. Vehicle platoon formation using interpolating control: a laboratory experimental analysis. Transp Res Part C Emerg Technol 2017;84:21–47.

[161] Ploeg J, Semsar-Kazerooni E, Medina AIM, de Jongh JF, van de Sluis J, Voronov A, et al. Cooperative automated maneuvering at the 2016 grand cooperative driving challenge. IEEE Trans Intell Transp Syst 2017;19(4):1213–26.

[162] Hult R, Sancar FE, Jalalmaab M, Vijayan A, Severinson A, Di Vaio M, et al. Design and experimental validation of a cooperative driving control architecture for the grand cooperative driving challenge 2016. IEEE Trans Intell Transp Syst 2018;19(4):1290–301.

[163] Alonso IP, Gonzalo RI, Alonso J, García-Morcillo Á, Fernández-Llorca D, Sotelo MÁ. The experience of drivertive-driverless cooperative vehicle-team in the 2016 GCDC. IEEE Trans Intell Transp Syst 2017;19(4):1322–34.

[164] Eilers S, Mårtensson J, Pettersson H, Pillado M, Gallegos D, Tobar M, et al. Companion—towards co-operative platoon management of heavy-duty vehicles. In: Proceedings of 2015 IEEE 18th International Conference on Intelligent Transportation Systems; 2015 Sep 15–18; Gran Canaria, Spain.

IEEE; 2015. p. 1267–73. [165] Zhang J, Ioannou PA, Chassiakos A. Automated container transport system between inland port and terminals. ACM Trans Model Comput Simulat 2006;16(2):95–118.

[166] Pourmohammad-Zia N, Schulte F, Souravlias D, Negenborn RR. Platooning of automated ground vehicles to connect port and hinterland: a multi-objective optimization approach. In: Proceedings of International Conference on Computational Logistics; 2020 Sep 28–30; Enschede, the Netherlands.

Springer Cam; 2020. p. 780. [167] Chen S, Wang H, Meng Q. Autonomous truck scheduling for container transshipment between two seaport terminals considering platooning and speed optimization. Transp Res Part B Methodol 2021;154:289–315.

[168] Tsugawa S. An overview on an automated truck platoon within the energy its project. IF AC Proc 2013;46(21):41–6.

[169] Ceder AA. Public-transport vehicle scheduling with multi vehicle type. Transp Res Part C Emerg Technol 2011;19(3):485–97.

[170] Hassold S, Ceder A. Multiobjective approach to creating bus timetables with multiple vehicle types. Transp Res Rec 2012;2276(1):56–62.

[171] Hassold S, Ceder AA. Public transport vehicle scheduling featuring multiple vehicle types. Transp Res Part B Methodol 2014;67:129–43.

[172] Guo QW, Chow JY, Schonfeld P. Stochastic dynamic switching in fixed and flexible transit services as market entry-exit real options. Transp Res Procedia 2017;23:380–99.

[173] Dai Z, Liu XC, Chen X, Ma X. Joint optimization of scheduling and capacity for mixed traffic with autonomous and human-driven buses: a dynamic programming approach. Transp Res Part C Emerg Technol 2020;114:598–619.

[174] Chen Z, Li X, Zhou X. Operational design for shuttle systems with modular vehicles under oversaturated traffic: continuous modeling method. Transp Res Part B Methodol 2020;132:76–100.

[175] Chen Z, Li X, Zhou X. Operational design for shuttle systems with modular vehicles under oversaturated traffic: discrete modeling method. Transp Res Part B Methodol 2019;122:1–19.

[176] Shi X, Chen Z, Pei M, Li X. Variable-capacity operations with modular transits for shared-use corridors. Transp Res Rec 2020;2674(9):230–44.

[177] Liu X, Qu X, Ma X. Improving flex-route transit services with modular autonomous vehicles. Transp Res Part E Logist Trans Rev 2021;149:102331.

[178] Chen Z, Li X, Qu X. A continuous model for designing corridor systems with modular autonomous vehicles enabling station-wise docking. Transport Sci 2022;56(1):1–30.

[179] Scholte W, Zegelaar PW, Nijmeijer H. A control strategy for merging a single vehicle into a platoon at highway on-ramps. Transp Res Part C Emerg Technol 2022;136:103511.

[180] Hsu HCH, Liu A. Kinematic design for platoon-lane-change maneuvers. IEEE Trans Intell Transp Syst 2008;9(1):185–90.

[181] Featherstone C, Lowson M. Safety of automated passenger vehicle platooning. In: Proceedings of 12th World Congress on Intelligent Transport Systems; 2005 Nov 6–10; San Francisco, CA, USA. ITS America; 2005. p. 1665–73.

[182] Li N, Chen S, Zhu J, Sun DJ. A platoon-based adaptive signal control method with connected vehicle technology. Comput Intell Neuro 2020;2020:2764576.

[183] Zhang Y, Su R, Zhang Y. A dynamic optimization model for bus schedule design to mitigate the passenger waiting time by dispatching the bus platoon. In: Proceedings of 2020 American Control Conference (ACC); 2020 Jul 1–3; Denver, CO, USA. IEEE; 2020. p. 4096–101.

[184] Paranjothi A, Atiquzzaman M, Khan MS. PMCD: platoon-merging approach for cooperative driving. Int Technol Lett 2020;3(1):e139.

[185] Cameron GD, Duncan GI. Paramics—parallel microscopic simulation of road traffic. J Supercomput 1996;10(1):25–53.

[186] Gao W, Gao J, Ozbay K, Jiang Z. Reinforcement-learning-based cooperative adaptive cruise control of buses in the Lincoln tunnel corridor with time￾varying topology. IEEE Trans Intell Transp Syst 2019;20(10):3796–805.

[187] Shaaban K, Kim I. Comparison of Simtraffic and VISSIM microscopic traffic simulation tools in modeling roundabouts. Procedia Comput Sci 2015;52:43–50.

[188] Lu L, Yun T, Li L, Su Y, Yao D. A comparison of phase transitions produced by Paramics, Transmodeler, and VISSIM. IEEE Intell Transp Syst Mag 2010;2 (3):19–24.

[189] Seredynski M, Grzybek A. Coping with non-recurring congestion with distributed hybrid routing strategy. In: Proceedings of 2016 IEEE Intelligent Vehicles Symposium (IV); 2016 Jul 19–22; Gothenburg, Sweden. IEEE; 2016.

p. 1121–7. [190] Gerla M, Kleinrock L. Vehicular networks and the future of the mobile internet. Comput Netw 2011;55(2):457–69.

[191] De Rango F, Tropea M, Raimondo P, Santamaria AF, Fazio P. Bio inspired strategy for improving platoon management in the future autonomous electrical VANET environment. In: Proceedings of 2019 28th International Conference on Computer Communication and Networks (ICCCN); 2019 Jul

29–Aug 1; Valencia, Spain. IEEE; 2019. p. 1–7. [192] Rondinone M, Maneros J, Krajzewicz D, Bauza R, Cataldi P, Hrizi F, et al.

ITETRIS: a modular simulation platform for the large scale evaluation of cooperative its applications. Simul Model Pract Theory 2013;34:99–125.

[193] Sommer C, Eckhoff D, Brummer A, Buse DS, Hagenauer F, Joerer S, et al. Veins: the open source vehicular network simulation framework. Recent Advances in Network Simulation. Online. Springer Cham; 2019.

[194] Won M. L-platooning: a protocol for managing a long platoon with DSRC. 2019. ArXiv:1910.05192.

[195] Shladover SE, Su D, Lu XY. Impacts of cooperative adaptive cruise control on freeway traffic flow. Transp Res Rec 2012;2324(1):63–70.

[196] Yu L. Calibration of platoon dispersion parameters on the basis of link travel time statistics. Transp Res Rec 2000;1727(1):89–94.

[197] Sebe SM, Müller JP. PFARA: a platoon forming and routing algorithm for same-day deliveries. 2019. ArXiv:1912.08929.

[198] Zhu M, Liu C, Han Y. Approach to discovering companion patterns based on traffic data stream. IET Intell Transp Syst 2018;12(10):1351–9.

[199] Saha A, Chandra S, Ghosh I. Modeling platoon dispersion at signalized intersections in mixed traffic scenario. Arab J Sci Eng 2019;44(5):4829–38.

[200] Punzo V, Borzacchiello MT, Ciuffo B. On the assessment of vehicle trajectory data accuracy and application to the next generation simulation (NGSIM) program data. Transp Res Part C Emerg Technol 2011;19(6):1243–62.

[201] Calvert SC, Mecacci G, Heikoop DD, De Sio FS. Full platoon control in truck platooning: a meaningful human control perspective. In: Proceedings of 2018 21st International Conference on Intelligent Transportation Systems (ITSC); 2018 Nov 4–7; Maui, HI, USA. IEEE; 2018. p. 3320–6.

[202] Chen G, Cao H, Conradt J, Tang H, Rohrbein F, Knoll A. Event-based neuromorphic vision for autonomous driving: a paradigm shift for bio￾inspired visual sensing and perception. IEEE Signal Process Mag 2020;37 (4):34–49.

[203] Chen G, Wang F, Li W, Hong L, Conradt J, Chen J, et al. Neuroiv: neuromorphic vision meets intelligent vehicle towards safe driving with a new database and baseline evaluations. IEEE Trans Intell Transp Syst 2020;23(2):1171–83.

[204] Liu W, Quijano K, Crawford MM. YOLOV5-TASSEL: detecting tassels in RGB UAV imagery with improved YOLOV5 based on transfer learning. IEEE J Sel Top Appl Earth Obs Remote Sens 2022;15:8085–94.

[205] Jiang C, Ding Z, Yu J, Zhang S, Yan C, Zhang Y, et al. Cabin computing. Sci Sin Inform 2021;51(8):1233–54.

[206] Robertson FH, Bourriez F, He M, Soper D, Baker C, Hemida H, et al. An experimental investigation of the aerodynamic flows created by lorries travelling in a long platoon. J Wind Eng Ind Aerodyn 2019;193:103966.

J. Hou, G. Chen, J. Huang et al. Engineering 28 (2023) 26–48 48