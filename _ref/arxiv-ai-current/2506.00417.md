1

# World Models for Cognitive Agents: Transforming Edge Intelligence in Future Networks

Changyuan Zhao, Ruichen Zhang, Jiacheng Wang, Gaosheng Zhao, Dusit Niyato _Fellow, IEEE_,
Geng Sun, Shiwen Mao _Fellow, IEEE_, Dong In Kim, _Life Fellow, IEEE_


_**Abstract**_ **—World models are emerging as a transformative**
**paradigm in artificial intelligence, enabling agents to construct**
**internal representations of their environments for predictive**
**reasoning, planning, and decision-making. By learning latent dy-**
**namics, world models provide a sample-efficient framework that**
**is especially valuable in data-constrained or safety-critical scenar-**
**ios. In this paper, we present a comprehensive overview of world**
**models, highlighting their architecture, training paradigms, and**
**applications across prediction, generation, planning, and causal**
**reasoning. We compare and distinguish world models from**
**related concepts such as digital twins, the metaverse, and founda-**
**tion models, clarifying their unique role as embedded cognitive**
**engines for autonomous agents. We further propose Wireless**
**Dreamer, a novel world model-based reinforcement learning**
**framework tailored for wireless edge intelligence optimization,**
**particularly in low-altitude wireless networks (LAWNs). Through**
**a weather-aware UAV trajectory planning case study, we demon-**
**strate the effectiveness of our framework in improving learning**
**efficiency and decision quality.**

_**Index Terms**_ **—Edge intelligence, wireless communications, low-**
**altitude wireless networks**

I. I NTRODUCTION

In the science fiction film _The Matrix_, the eponymous
system serves as a platform that forecasts future outcomes
based on the protagonist’s decisions. This fictional technology
presents a compelling vision: if artificial intelligence (AI)
models can accurately internalize the workings of the real
world, they could unlock the ability to perform complex
tasks through predictive reasoning. This idea is now gaining
significant attention in AI research: _how can AI, like humans,_
_learn the fundamental laws governing our world and make_
_informed predictions?_
Motivated by this idea, _world models_ have emerged as
a class of AI systems that learn an internal model of the
environment’s dynamics, such as its physical laws and spatial
properties [1] . By predicting future observations and rewards,
they provide an agent with an “imagination” space for various

C. Zhao is with the College of Computing and Data Science, Nanyang
Technological University, Singapore, and CNRS@CREATE, 1 Create Way,
08-01 Create Tower, Singapore 138602 (e-mail: zhao0441@e.ntu.edu.sg).
R. Zhang, J. Wang, and D. Niyato are with the College of Computing
and Data Science, Nanyang Technological University, Singapore (e-mail:
ruichen.zhang@ntu.edu.sg, jiacheng.wang@ntu.edu.sg, dniyato@ntu.edu.sg).
G. Sun is with College of Computer Science and Technology, Jilin University, China 130012, (e-mail: sungeng@jlu.edu.cn).
S. Mao is with the Department of Electrical and Computer Engineering,
Auburn University, Auburn, USA (e-mail: smao@ieee.org).
G. Zhao and D. I. Kim are with the Department of Electrical and Computer
Engineering, Sungkyunkwan University, Suwon 16419, South Korea (e-mail:
gaosheng@skku.edu, dongin@skku.edu).
1 https://www.nvidia.com/en-sg/glossary/world-models


tasks, including planning and control. Concretely, world models are typically built upon generative AI (GenAI) frameworks
trained to reconstruct past observations and forecast future
trajectories. By implicitly capturing the rules and patterns of
the environment, the world model estimates what is likely
to happen next. Rather than relying solely on immediate
sensor data, the agent uses this internal model as a forwardlooking guide, much like a chess player thinking several
moves ahead or a driver intuitively expecting a pedestrian to
jaywalk. In essence, the world model grants the AI agent a
cognitive capacity to perceive, anticipate, and reason about its
environment, enabling it to make more informed and adaptive
decisions under uncertainty.
In contrast with traditional AI models built for single or a
few tasks, a world model offers a general framework whose
main advantage is its ability to generalize to diverse downstream tasks, including generation, planning, and reasoning.
While the world model acts as the brain that provides the
agent with an understanding of the real world, its specific
focus varies depending on the task. For generation tasks, world
models act as imagination engines, creating plausible future
scenarios and generating remarkably realistic video sequences
that adhere to physical laws, emphasizing that these models
capture fundamental principles [1]. In terms of planning, such
as autonomous driving, a world model allows an agent to
mentally simulate action sequences and predict unexpected
events, enhancing its robustness in real-world execution [2].
When it comes to reasoning, the agent leverages world models
to anticipate the consequences of its decisions and infer hidden
causes, strengthening its decision-making with almost humanlike foresight [3].
Given these strengths, world models are increasingly recognized as foundational for advanced cognitive agents. As
humans use mental models to understand and navigate their
environment, AI systems embed world models at the core
of their cognitive architecture to guide both perception and
action. Many state-of-the-art systems, such as Wayve’s GAIA
model for safer assisted and autonomous driving [2], exemplify
this approach. Looking ahead to next-generation networks,
where countless smart devices and autonomous systems operate at the edge, world models can be transformative. Edge
agents, from self-driving cars and delivery drones to intelligent
sensors, must often make instant decisions locally, without
relying on constant cloud connectivity. By equipping them
with robust world models, these agents can predict, plan, and

2 https://wayve.ai/thinking/gaia-2/

2

act directly on-site, improving responsiveness and reducing
dependence on cloud back-ends. Companies such as NIO have
already embraced this paradigm, developing the NIO World
Model specifically for on-car AI predictions [3] .
Building on these foundations, this paper provides a comprehensive perspective on world models, covering from concept to deployment. We then introduce several applications
and highlight their potential impact in the realm of edge
intelligence. Furthermore, we propose a world model framework, Wireless Dreamer, for wireless edge intelligence optimizations. Unlike traditional optimization or reinforcement
learning (RL) methods, our approach leverages a world model
to recover and predict data for more effective decision-making
in low-altitude wireless networks (LAWNs). _To the best of_
_our knowledge_, this is the first work to explore the integration
of world models for wireless edge intelligence and decisionmaking in LAWNs. The key contributions of this work are
summarized as follows:

_•_ We delve into the concept and deployment of world
models, highlighting their advantages. Subsequently, we
provide a detailed comparison between world models and
other approaches, emphasizing their uniqueness.

_•_ We propose a world model framework, Wireless Dreamer,
for wireless edge intelligence optimizations, which leverages world models to enhance and predict perception
data, supporting effective decision-making.

_•_ We consider a weather-aware UAV-assisted wireless com
munication task in LAWNs through UAV trajectory planning, as a case study. We employ the Wireless Dreamer
framework to solve the problem and demonstrate the
effectiveness of this framework by benchmarking it with
several baselines.

II. O VERVIEW OF W ORLD M ODELS

_A. General Concept of World Models_

A world model is an internal representation that an intelligent system uses to understand and predict environmental
dynamics. It serves as a cognitive map or simulator, encoding
the external world’s state in compressed latent variables and
modeling its temporal evolution, allowing the agent to anticipate outcomes and plan actions accordingly [3]. World models
can be broadly classified into two functional categories:

_•_ **Implicit Representation:** These models capture environmental dynamics as latent representations, supporting
more informed decision-making through an LLMs, the
transformation of real-world phenomena into implicit
knowledge enhances decision-making by enabling the
models to represent and reason about complex world
knowledge.

_•_ **Dynamics Modeling:** These models use current observations to predict future events by modeling continuous
spatial and temporal dynamics. For instance, large vision
models (LVMs) and vision-language models (VLMs) [4],
such as Sora and Kling AI, can generate video content
that reflects physical laws, effectively modeling dynamic

3 https://www.nio.cn/smart-technology/20241120002


processes including motion trajectories, obstacle interactions, and other real-world physical behaviors.

Based on these functional categories, the world model integrates knowledge learning and environment modeling to create
a comprehensive system capable of complex interactions with
dynamic environments, supporting various downstream tasks.
As depicted in Fig. 1, the general workflow and structure of
world models includes:

_•_ **Encoder:** First, the raw sensory inputs are processed
and encoded into a structured internal representation.
Through dimensionality reduction and feature extraction,
these diverse and complex observations are transformed
into compact and meaningful representations that reflect
the essential characteristics of the environment.

_•_ **Modeling:** Utilizing encoded representations, the world
model effectively models and analyzes the physical environment. Subsequently, the model predicts the evolution
of the physical environment over time. Accurate dynamics modeling allows for imagining future states, enabling
proactive and anticipatory responses from agents.

_•_ **Decoder:** By leveraging predictive understanding of future states, the model ultimately supports diverse downstream tasks such as autonomous driving and robot
control, through decoding its implicit representations.
Incorporating techniques such as RL can further enhance
this process.

It is worth noting that the last part, the decoder, is a
downstream task-dependent module, so the same world model
can be adapted to different downstream tasks by swapping or
fine-tuning different decoders [5].

_B. Deployment of World Models_

Training and deploying world models typically leverage
GenAI approaches, where the model learns implicit representations of the input data and generates content that mimics the
same underlying data distribution. When the input consists
of real-world environmental data, such as radar, LiDAR,
or videos, the GenAI model can generate new content to
predict various aspects of the environment based on a given
prompt that specifies which elements are most important. Two
predominant training paradigms are self-supervised learning
and unsupervised learning, both of which exploit unlabeled
data to learn the model, as shown in Fig. 1.

_•_ **Unsupervised Learning:** The world models learn representation in the environment data without explicit prediction tasks. Common approaches include autoencoders
(AEs), variational autoencoders (VAEs), and diffusion
models, which learn abstract state representations that
serve as a foundation for further analysis [6]. For example, in semantic communication, an agent might compress
high-dimensional camera images into a latent state that
retains essential details about the scene. These learned

representations enable more efficient processing, transmission, and decision-making in complex environments.

_•_ **Self-supervised Learning:** The world models learn surrogate tasks from raw data, such as predicting the next

3




~~_Modeling_~~

















_**Imagination & prediction:**_
_What Happens Next?_

_**World Model**_











**Representation Dynamics**


**Modeling**


**Encoder**


Fig. 1: Illustration of world models for next-generation edge intelligence. The bottom part shows the workflow and structure
of world models, including their training and deployment. The middle part illustrates the core functions of world models. The
top part highlights the three core applications of world models and their potential application in a real-world environment.


state from the current context, and use this for selfsupervision. Once trained, they can generate future trajectories by iteratively predicting each step [7]. Recently,
Transformer-based sequence models, including LLMs,
have been applied, treating sequences of states as “sentences,” predicting one token at a time. For example, a
world model could forecast traffic load and channel conditions at base stations based on historical data, enabling
intelligent spectrum allocation and power control.

The key distinction between these methods is that unsupervised learning captures the structure or appearance of the
world, while supervised learning focuses on predicting the
next event. These align with the two roles of a world model:
**Implicit Representation** and **Prediction** .

_C. Comparison with Other Models_

_1) World Models vs. Digital Twins:_ A digital twin is a highfidelity virtual replica of a physical system, designed to mirror
the state of its real-world counterpart in real time [8]. It serves
as an external, synchronized model used by humans or AI
for testing and issue detection. In contrast, a world model
is an internal, abstract representation learned by AI agents,
focused on achieving agents’ goals. While a digital twin aims
for detailed accuracy, often as a stand-alone system, a world
model prioritizes efficient decision-making and adaptability,
integrated within the agent’s reasoning.


_2) World Models vs. the Metaverse:_ The metaverse refers
to a persistent, interconnected virtual world blending physical
and digital realities, where users and AI interact in real
time [9]. It hosts both digital twins of real-world objects and
fictional elements, aiming for immersive experiences rather
than strict realism. While the metaverse is an external, shared
space used for interaction and experimentation, world models
are internal tools for decision-making. Therefore, the metaverse can serve as a platform to build and test world models,
offering a rich, high-fidelity environment for training network
control systems.

_3) World Models vs. Foundation Models:_ The foundation
model is a broad-coverage neural network pre-trained on
massive, heterogeneous corpora, including text, images, and
code, to distill general representations ready for zero-/fewshot adaptation [10]. In contrast, a world model is embodied
within an agent, compressing a specific environment into latent
states and transition dynamics to guide planning and control.
Foundation models provide general knowledge that can help
world models understand perception or language, while the
policy execution gained through world model actions can
improve foundation models by enhancing their reasoning and
real-world alignment in turn.

To summarize, we can posit an analogy related to a citybuilding project. The world model represents the engineer’s
mental sandbox for simulating various outcomes. The digital
twin reflects the real-time construction site. The metaverse

4


TABLE I: Comparison of World Models with Other Models and Their Downstream Applications













|World Model Comparison with Other Models|Col2|Col3|Col4|Col5|Col6|Col7|Col8|Col9|
|---|---|---|---|---|---|---|---|---|
|Name|Definition|Definition|Function|Function|Technical Foundation|Technical Foundation|Applications|Advantages|
|World Model<br>[3]|An internal representation that an<br>intelligent system uses to understand<br>and predict environmental dynamics|An internal representation that an<br>intelligent system uses to understand<br>and predict environmental dynamics|• Imagination<br>• Representation<br>• Dynamics modeling<br>• Support for downstream tasks|• Imagination<br>• Representation<br>• Dynamics modeling<br>• Support for downstream tasks|• GenAI<br>• Unsupervised/self-supervised<br>learning<br>• Internet of things sensing|• GenAI<br>• Unsupervised/self-supervised<br>learning<br>• Internet of things sensing|• Robot navigation<br>• Autonomous driving<br>• Game playing|• Future state prediction<br>• Reasoning and decision-making<br>• Generalization & adaptability|
|Digital Twin<br>[8]|A high-fidelity virtual replica of a<br>physical system, designed to mirror<br>the state of its real-world counterpart<br>in real time|A high-fidelity virtual replica of a<br>physical system, designed to mirror<br>the state of its real-world counterpart<br>in real time|• Condition monitoring<br>• Performance analysis<br>• Predictive maintenance<br>• Remote control|• Condition monitoring<br>• Performance analysis<br>• Predictive maintenance<br>• Remote control|• Internet of things sensing<br>• Real-time data streaming<br>• Physics-based simulation<br>• Edge & cloud computing|• Internet of things sensing<br>• Real-time data streaming<br>• Physics-based simulation<br>• Edge & cloud computing|• Smart city utilities<br>• Aerial Omniverse Twin<br>• City-Scale Spectrum<br>Twin|• Risk-free testing<br>• Visualization & monitoring<br>• Cost-saving predictive<br>maintenance|
|Metaverse<br>[9]|A persistent, interconnected virtual<br>world blending physical and digital<br>realities, where users and AI interact<br>in real time|A persistent, interconnected virtual<br>world blending physical and digital<br>realities, where users and AI interact<br>in real time|• Social interaction<br>• User-generated content<br>• Economic transactions<br>• Immersive experiences|• Social interaction<br>• User-generated content<br>• Economic transactions<br>• Immersive experiences|• Physical devices<br>• 5G/6G network<br>• Blockchain & digital assets<br>• AI-driven content generation|• Physical devices<br>• 5G/6G network<br>• Blockchain & digital assets<br>• AI-driven content generation|• Immersive social<br>platforms<br>• Digital exhibitions<br>• Virtual events|• Immersive interaction<br>• Open innovation ecosystem<br>• Physical-digital fusion<br>• Training & validation platform|
|Foundation<br>Models<br>[10]|A broad-coverage neural network pre-<br>trained on massive, heterogeneous<br>corpora to distill general<br>representations for adaptation|A broad-coverage neural network pre-<br>trained on massive, heterogeneous<br>corpora to distill general<br>representations for adaptation|• Universal representation<br>learning<br>• Few-/zero-shot adaptation<br>• Multimodal fusion and cross-<br>modal reasoning|• Universal representation<br>learning<br>• Few-/zero-shot adaptation<br>• Multimodal fusion and cross-<br>modal reasoning|• Unsupervised/self-supervised<br>learning<br>• Alignment techniques<br>• Mixture-of-experts & retrieval-<br>augmented modules|• Unsupervised/self-supervised<br>learning<br>• Alignment techniques<br>• Mixture-of-experts & retrieval-<br>augmented modules|• Text, code, image, and<br>audio generation<br>• Autonomous robotics<br>and embodied AI<br>• Scientific discovery|• Broad knowledge base spanning<br>many domains<br>• Emergent reasoning and<br>planning abilities<br>• Rapid task transfer|
|World Model Downstream Applications|World Model Downstream Applications|World Model Downstream Applications|World Model Downstream Applications|World Model Downstream Applications|World Model Downstream Applications|World Model Downstream Applications|World Model Downstream Applications|World Model Downstream Applications|
|Downstream Tasks|Downstream Tasks|Characteristics|Characteristics|Applications|Architecture|Paper & Code|Paper & Code|Paper & Code|
|Generating|Generating|• Prioritizes long-horizon predictability<br>• Embeds physical constraints, e.g.,<br>conservation laws, dynamics equations<br>• Each frame is a dynamically consistent<br>rollout from previous states|• Prioritizes long-horizon predictability<br>• Embeds physical constraints, e.g.,<br>conservation laws, dynamics equations<br>• Each frame is a dynamically consistent<br>rollout from previous states|• Long-form video<br>synthesis<br>• Action-conditioned<br>video generation<br>• 4D reconstruction|1. WorldDreamer<br>2. Adapting video<br>diffusion (AVID)|1. Wang, Xiaofeng, et al. "Worlddreamer: Towards general world models for video generation via predicting<br>masked tokens." arXiv preprint arXiv:2401.09985 (2024).<br>Available code at: world-dreamer.github.io<br>2. Rigter, Marc, et al. "Avid: Adapting video diffusion models to world models." arXiv preprint<br>arXiv:2410.12822 (2024).<br>Available code at: sites.google.com/view/avid-world-model-adapters/home|1. Wang, Xiaofeng, et al. "Worlddreamer: Towards general world models for video generation via predicting<br>masked tokens." arXiv preprint arXiv:2401.09985 (2024).<br>Available code at: world-dreamer.github.io<br>2. Rigter, Marc, et al. "Avid: Adapting video diffusion models to world models." arXiv preprint<br>arXiv:2410.12822 (2024).<br>Available code at: sites.google.com/view/avid-world-model-adapters/home|1. Wang, Xiaofeng, et al. "Worlddreamer: Towards general world models for video generation via predicting<br>masked tokens." arXiv preprint arXiv:2401.09985 (2024).<br>Available code at: world-dreamer.github.io<br>2. Rigter, Marc, et al. "Avid: Adapting video diffusion models to world models." arXiv preprint<br>arXiv:2410.12822 (2024).<br>Available code at: sites.google.com/view/avid-world-model-adapters/home|
|Planning|Planning|• Provides an explicit multi-step rollout of<br>future trajectories<br>• Elevates policy evaluation based on the<br>full future distribution<br>• Widens the decision horizon, easing<br>sparse- or delayed-reward problems|• Provides an explicit multi-step rollout of<br>future trajectories<br>• Elevates policy evaluation based on the<br>full future distribution<br>• Widens the decision horizon, easing<br>sparse- or delayed-reward problems|• Game playing<br>• Long-task control<br>• Autonomous driving|1. DreamerV2<br>2. UniZero|1. Hafner, Danijar, et al. "Mastering atari with discrete world models." arXiv preprint arXiv:2010.02193 (2020).<br>Available code at: github.com/danijar/dreamerv2<br>2. Pu, Yuan, et al. "Unizero: Generalized and efficient planning with scalable latent world models." arXiv<br>preprint arXiv:2406.10667 (2024).<br>Available code at: github.com/opendilab/LightZero|1. Hafner, Danijar, et al. "Mastering atari with discrete world models." arXiv preprint arXiv:2010.02193 (2020).<br>Available code at: github.com/danijar/dreamerv2<br>2. Pu, Yuan, et al. "Unizero: Generalized and efficient planning with scalable latent world models." arXiv<br>preprint arXiv:2406.10667 (2024).<br>Available code at: github.com/opendilab/LightZero|1. Hafner, Danijar, et al. "Mastering atari with discrete world models." arXiv preprint arXiv:2010.02193 (2020).<br>Available code at: github.com/danijar/dreamerv2<br>2. Pu, Yuan, et al. "Unizero: Generalized and efficient planning with scalable latent world models." arXiv<br>preprint arXiv:2406.10667 (2024).<br>Available code at: github.com/opendilab/LightZero|
|Reasoning|Reasoning|• Models the full action-system-outcome<br>causal chain<br>• Predicts “what-if” ripple effects to assess<br>system-wide consequences<br>• Enables rich counterfactual analysis and<br>interpretable inference|• Models the full action-system-outcome<br>causal chain<br>• Predicts “what-if” ripple effects to assess<br>system-wide consequences<br>• Enables rich counterfactual analysis and<br>interpretable inference|• Legal and forensic<br>causality analysis<br>• Causal reasoning|1. Reasoning via<br>Planning (RAP)<br>2. Large World<br>Model (LWM)|1. Hao, Shibo, et al. "Reasoning with language model is planning with world model." arXiv preprint<br>arXiv:2305.14992 (2023).<br>Available code at: github.com/Ber666/ llm-reasoners<br>2. Liu, Hao, et al. "World model on million-length video and language with blockwise ringattention." arXiv<br>preprint arXiv:2402.08268 (2024).<br>Available code at: largeworldmodel.github.io/lwm|1. Hao, Shibo, et al. "Reasoning with language model is planning with world model." arXiv preprint<br>arXiv:2305.14992 (2023).<br>Available code at: github.com/Ber666/ llm-reasoners<br>2. Liu, Hao, et al. "World model on million-length video and language with blockwise ringattention." arXiv<br>preprint arXiv:2402.08268 (2024).<br>Available code at: largeworldmodel.github.io/lwm|1. Hao, Shibo, et al. "Reasoning with language model is planning with world model." arXiv preprint<br>arXiv:2305.14992 (2023).<br>Available code at: github.com/Ber666/ llm-reasoners<br>2. Liu, Hao, et al. "World model on million-length video and language with blockwise ringattention." arXiv<br>preprint arXiv:2402.08268 (2024).<br>Available code at: largeworldmodel.github.io/lwm|


offers a shared virtual space for collaboration among team
members. Lastly, the foundation model serves as a knowledgeable advisor, providing guidance to inform decision-making
based on broad expertise. For a more intuitive understanding,
we present a comprehensive comparison in the Table I.

III. A PPLICATIONS OF W ORLD M ODELS

_A. Predicting_

The core application of the world model is to learn implicit expression and prediction. Formally, a world model is
trained to approximate the latent Markov process, thereby
internalizing how the environment evolves from one instant to
the next. For example, in the seminal work [11], a recurrent
network was used as a world model to predict the next state
and reward based on the agent’s action in the CarRacing
game. Through ablation studies, the authors demonstrated that
removing this world model led to a 30% drop in gaming
score and a significant increase in variance [11]. Unlike
traditional RL, which directly maps observations to actions,
a world model-based approach leverages predictive modeling
to anticipate outcomes. These predictive capabilities not only
improve action selection but also support downstream tasks,
such as control, forecasting, and anomaly detection, which are
further explored throughout this paper.

_B. Generating_

For generative tasks of world models, the central objective
is to produce coherent temporal data, video streams, and 4-D
scene reconstructions. Unlike conventional video generation
networks, a world model prioritizes long-horizon predictability


and explicit adherence to underlying physical laws. For example, WorldDreamer is a video world model that learns universal
motion and physical dynamics, which are embedded in visual
signals [12]. Built on a Spatial–Temporal Patchwise Transformer, the model restricts attention to localized windows in
both space and time, allowing it to capture fine-grained visual
dynamics efficiently. Consequently, WorldDreamer supports
several generating tasks, including video inpainting, video
stylization, and action-to-video generation, within a single
unified framework. Remarkably, it can synthesize a highquality 24-frame video at 192 _×_ 320 resolution in just 3 seconds
on a single A800 GPU [12].

_C. Planning_

For planning tasks, the chief objective is to synthesize
anticipatory action sequences that maximize long-term returns.
Unlike conventional Markov-decision processes (MDPs) or
RL, where each policy update relies solely on the current
state, a world model furnishes the planner with a prediction
of future contingencies, effectively widening the decision
horizon beyond one-step transition probabilities. For instance,
DreamerV2 learns long-horizon behaviour entirely within this
learned world model, employing an actor–critic framework to
learn the policy [5]. The actor selects actions by imagining
sequences of compact latent states, while the critic aggregates the predicted future rewards to capture returns that
lie beyond the planning horizon. Notably, DreamerV2 attains
human-level performance on the Atari benchmark, achieving
a gamer-normalized median score above 2.0 compared with
the human gamer baseline of 1.0 [5].

_D. Reasoning_

For reasoning tasks, the primary goal is to reveal the underlying causal mechanisms driving the environment’s behavior.
Unlike conventional statistical methods that merely capture
correlations between surface-level features, a world model
simulates and anticipates how actions will ripple through the
system. For example, the authors in [13] proposed a LLM
reasoning framework called Reasoning via Planning (RAP).
RAP constructs a reasoning tree guided by a world model
to identify high-reward reasoning paths that properly balance
exploration and exploitation. In various challenging reasoning
tasks, RAP combined with LLaMA-33B even outperformed
chain-of-thought (CoT) prompting with GPT-4, achieving a
33% relative improvement in the plan generation task [13].

_E. World Model and Next-generation Edge Intelligence_

In edge intelligence deployments such as autonomous
drones, smart-factory robots, and mixed-reality headsets, devices face sparse on-device observations, task-specific retraining overhead, and intermittent or low-rate connectivity. Deploying a world model at the edge mitigates these constraints
by completing occluded regions or forecasting future frames
to sustain robust perception and prediction from minimal raw
input. Techniques in 6G communication, such as semantic
compression, which transmits only task-relevant bits by packetizing latent codes and imagined trajectories, shrink spectrum
usage without degrading decision quality, while edge–cloud
split inference leveraging holographic multi-input multi-output
(MIMO) and sub-THz backhaul lets heavy layers of the world
model execute in micro-datacenters and latency-critical layers
remain on-device. In short, world models confer foresight,
causal reasoning, and sample-efficient learning on edge devices, while 6G supplies the bandwidth, low latency, and
semantic protocols to train, distribute, and maintain those
models at scale.

IV. W ORLD M ODEL FOR W IRELESS E DGE I NTELLIGENCE

O PTIMIZATION

_A. Spatio-temporal Optimization Challenges in Wireless Intel-_
_ligence Networks_

Spatio-temporal optimization is an important issue in wireless intelligent networks, especially in advanced LAWNs, such
as UAV-based communication systems, which face unique
challenges due to their dynamic, time-varying nature. For example, in LAWNs, the communication links fluctuate with unpredictable environmental conditions, interference, and UAV
mobility, cascading effects on network performance in the
future. In summary, the key challenges in wireless edge
intelligence networks include:

_•_ **Highly Dynamic Environments:** LAWNs experience
rapid changes in topology and environmental conditions.
UAVs functioning as flying base stations must dynamically adapt to maintain coverage and throughput.

_•_ **Sequential Decision Coupling:** Actions are coupled
across time, influencing the state of the network in
subsequent moments. Optimizing over time thus requires
foresight, anticipating the environment changing.


5

_•_ **Partial Observability and Uncertainty:** In practice, the
agent may not know future user demand or channel
conditions with certainty. It must infer and learn spatiotemporal patterns to make proactive decisions.

These challenges highlight the need for an intelligent optimization framework that plans ahead and adapts to the
spatio-temporal dynamics of wireless intelligence networks.
Traditional RL algorithms such as Deep Q-Network (DQN)
are model-free, which learn policies by direct trial-and-error
in the environment, without learning an internal model [14].
In a complex wireless network, a DQN agent would need
to experience a large variety of network conditions and long
sequences of actions to eventually stumble upon an effective
long-term strategy. This is impractical in real-world scenarios
where each trial can degrade service or incur cost. Moreover,
model-free agents lack an explicit mechanism for spatiotemporal reasoning, whose decisions are reactive based on
the current state. Incorporating a world model addresses these
limitations by giving the agent the ability to simulate and
evaluate imagination scenarios internally. Instead of relying
solely on incremental learning from real experiments, the agent
can predict the outcome of potential action sequences in its
learned simulator of the network. This provides several key
benefits for spatio-temporal optimization:

_•_ **Multi-step Planning:** The agent can generate imagined
future trajectories and assess the long-term consequences
of actions. By planning over these latent trajectories,
the agent develops far-sighted behaviors that account for
future rewards, rather than just immediate effects.

_•_ **Sample Efficiency:** With a world model, the agent learns
the dynamics from real data and then reuses that knowledge by simulating numerous virtual trajectories. This
drastically cuts down on the interactions with environments, especially when experiments on physical UAV
networks are costly or time-limited.

_•_ **Handling Uncertainty and Partial Observability:** The
world model’s latent state can serve as a form of memory,
integrating information over time. Agents can then infer
unobserved aspects of the system, such as the underlying
channel condition or user mobility patterns.

In summary, the world model provides the foresight and
structured memory that align naturally with the spatiotemporal optimization needs of advanced wireless networks.

_B. Proposed Framework_

To realize these benefits, we introduce Wireless Dreamer,
a Q-learning framework integrating a world model. It is
a framework tailored to solve spatio-temporal optimization
problems in networks of UAVs and other low-altitude wireless
platforms with a discrete action space. As shown in Fig. 2, our
framework consists of three main components analogous:

_•_ **Latent World Model:** a learned dynamics model that
predicts how the wireless network state changes over
time. This model ingests the current observation, such
as channel measurements, UAV locations, queue lengths,
and the previous latent state, and produces a predicted
next state and reward.

6


_World model_

𝑟̂ ", 𝑥) "
Imagination

𝑟̂ #, 𝑥) #

Imagination

𝑟̂ $, 𝑥) $


_**Case**_ **：** _**Weather-aware**_

_**trajectory planning**_


𝑧 "

𝑎 "

~~𝑧~~ ~~#~~

~~𝑎~~ ~~#~~

𝑧 $


Sample

{𝑥 ! }

Latent state

Imagined
trajectories


Replay buffer


Update
Q value

Target
Q-Network


Weather changing

~~_**Wireless**_~~ ~~_**Dreamer**_~~

Action execution

Q-Network

Action execution


_**Object**_ **：** _**Maximizing the Sum Data**_

_**Rate of Ground Users**_

_Step 1: Observation and State Encoding_ _:_ _At each time step, the agent observes the current network status._

_Step 2: Latent Imagination:_ _Given the newly updated latent state, the world model predicts future trajectories in the latent space._

_Step 3: Value Evaluation and Action Selection:_ _The world model generates potential trajectories. The Q Network is optimized to choose the optimal action._


Imagination

_Step 4: Action Execution and Environment Feedback:_ _The chosen action is then applied to the real environment, producing a new observation and a reward._

Fig. 2: The workflow of the proposed framework. The left part is the model structure of Wireless Dreamer, including a world
model, Q-network, and target Q-network. The bottom part presents the continuous processes of Wireless Dreamer. The right
part illustrates the weather-aware trajectory planning in a UAV-assisted scenario in LAWNs.



_•_ **Q Network:** a neural network that estimates the longterm value of a given latent state. In Wireless Dreamer,
the Q Network is trained on simulated trajectories from
the world model, learning to assess network states that
may never have been directly observed.

_•_ **Target Q Network:** a periodically updated replica of the
primary Q Network, used to generate stable bootstrap
targets during value learning.

_C. Wireless Dreamer Workflow Overview_

To illustrate how the components come together, Fig. 2
and the following steps outline the Wireless Dreamer workflow [4] . The process continually cycles through observation,
latent model update, imagination/planning, action selection,
and environment feedback, as detailed below:

1) **Observation and State Encoding:** At each time step
_t_, the agent observes the current network status _x_ _t_ . The
observation is fed through an encoder to update the
agent’s latent state _z_ _t_ .
2) **Latent Imagination:** Given the latent state _z_ _t_, the world
model predicts future trajectories in the latent space by
its world model. Conditioned on the selected action _a_ _t_,
it generates a sequence of latent states and intermediate
rewards, which can be decoded into reconstructed observations ˆ _x_ _t_ and predicted rewards ˆ _r_ _t_, respectively.
3) **Value Estimation and Action Selection:** The world
model generates potential latent states and corresponding
predicted rewards. The Q Network assesses each candidate by calculating _Q_ ( _z_ _t_ +1 _, a_ _t_ ) for discrete actions.
4) **Action Execution and Environment Feedback:** The
agent then picks action _a_ _t_ based on _Q_ ( _z_ _t_ +1 _, a_ _t_ ) to execute
in the real environment, producing a new observation
_x_ _t_ +1 and a reward _r_ _t_ . Over time, the world model
becomes more accurate in its predictions, and the policy
becomes more adept at choosing optimal actions.
Throughout this workflow, the Wireless Dreamer framework effectively integrates model-based planning with RL.

4 For more detailed information, including source codes
and experiment settings, please refer to this tutorial page:
https://changyuanzhao.github.io/Wireless Dreamer


By continuously learning and planning in the latent space, it
navigates the spatio-temporal complexity of wireless network
optimization. The agent can anticipate network behavior and
plan multi-step strategies, addressing the challenges identified
in Section IV-A.

V. C ASE S TUDY : W EATHER  - AWARE UAV T RAJECTORY

P LANNING

In this section, we present a case study on weather-aware
UAV trajectory planning and demonstrate how the proposed
framework enhances spatio-temporal optimization.

_A. System Model_

We consider a UAV-assisted wireless communication sce
nario in LAWNs, where a single UAV acts as a mobile base
station to provide downlink coverage for multiple ground users
under dynamic and spatially varying weather conditions, as
shown in Fig. 2. The UAV traverses a two-dimensional area
over a fixed time horizon and dynamically adjusts its position
to optimize communication performance while responding to
evolving environmental factors such as wind intensity.
This scenario involves one UAV and _N_ users randomly
distributed across a 64 _×_ 64 grid-based area, where each
grid is 4 _m ×_ 4 _m_ . The UAV operates over a 28 GHz
mmWave band with a total bandwidth of 100 MHz and a

transmission power of 30 dBm. The weather is modeled by
the Gaussian Field Model, which simulates a drifting Gaussian
hotspot to represent dynamic environmental factors such as
wind speed [15]. The hotspot’s position evolves over time,
directly affecting the communication path loss. The UAV aims
to maximize the total downlink capacity across users within
_T_ time steps, while its trajectory is influenced by the need to
avoid adverse weather zones and turbulence. This case study
considers 10 users and a time horizon of 100 steps.

_B. Numerical Results_

_1) Experimental Setup:_ Our experiment is conducted on a
Linux server equipped with an Ubuntu 22.04 operating system
and powered an NVIDIA RTX A6000 GPU. We benchmark
the proposed method with DQN [14] and a random policy.

950

900

850

800

750

700




650

0 100 200 300 400 500 600 700 800

Episode

Fig. 3: Comparison of average episodic rewards

10


9.5



9

8.5

8

7.5

7

6.5

0 10 20 30 40 50 60 70 80 90 100

Step

Fig. 4: Comparison between real and predicted rewards

_2) Performance Analysis:_ The average episodic rewards of
the three methods are shown in Fig. 3, where each point
represents the average reward over 20 consecutive episodes.
The results demonstrate that our proposed algorithm, Wireless
Dreamer (blue curve), rapidly discovers a superior policy and
converges to a stable performance. By episode 250, its average
reward reaches 923.55, clearly surpassing the optimal average
reward of 829.04 attained by DQN (red curve) during the same
training episodes. Furthermore, Wireless Dreamer’s coverage
by approximately episode 350 is about 46.15% faster than
DQN, which does not level off until roughly episode 650.
This performance gap stems from Wireless Dreamer’s capacity
to employ its learned world model for trajectory imagination
and prediction, extracting far richer trajectory information than
that available through direct environment interactions alone.
This benefit is critical for scenarios with restricted sensing
opportunities, such as the weather-aware UAV communication
environment examined in this work, where exhaustive collec
tion of environmental information is seldom feasible.

Moreover, we compare the real rewards and the predicted
rewards of our proposed method in the evaluation stage. As
illustrated in Fig. 4, the predicted rewards track the real
returns with high fidelity during evaluation. Over the entire
test set, the mean absolute error is 0.359 ± 0.262, and the
maximum deviation observed is 1.059, yielding an average
relative error of roughly 5%. Remarkably, during the first 30
decision steps, the predictions are nearly equal to the real
rewards, underscoring the world model’s ability to capture
agent state and reward dynamics.

_3) Limitations:_ As discussed in Section IV, the defining
advantage of Wireless Dreamer over conventional RL methods


7

is that real interactions are used to fit the world model, after
which the agent learns by generated trajectories. However, any
policy learned from the model inevitably inherits its prediction
errors, which compound over long-horizon prediction and can
degrade performance, as shown in Fig. 4. When abundant real
data are available, a model-free controller that learns directly
from the environment (i.e., DQN) may outperform Wireless
Dreamer because it is not subject to modelling bias. Therefore,
in future work, we will focus on reducing modelling error
and expanding the world model to applications with limited
interaction with the environment.

VI. C ONCLUSION

In this paper, we have explored the concept, architecture,
and deployment of world models as a foundation for cognitive
agents in future edge intelligence systems. We have provided
a detailed taxonomy and comparison with adjacent paradigms
such as digital twins, the metaverse, and foundation models,
positioning world models as internal cognitive mechanisms for
agents. We have introduced Wireless Dreamer, a world modelenhanced Q-learning framework that significantly improves
sample efficiency and temporal foresight in wireless edge
environments. Using a case study of weather-aware UAV
trajectory planning, we have shown that Wireless Dreamer
accelerates convergence by 46.15% compared to traditional
DQN and achieves high fidelity in reward prediction. In
summary, world models offer a promising path toward building
cognitive systems in the future network edge.

R EFERENCES

[1] Z. Zhu _et al._, “Is sora a world simulator? a comprehensive survey on
general world models and beyond,” _arXiv preprint arXiv:2405.03520_,
2024.

[2] Y. Guan _et al._, “World models for autonomous driving: An initial
survey,” _IEEE Trans. Intell. Transp. Syst._, 2024.

[3] J. Ding _et al._, “Understanding world or predicting future? a comprehensive survey of world models,” _arXiv preprint arXiv:2411.14499_, 2024.

[4] J. Zhang _et al._, “Vision-language models for vision tasks: A survey,”
_IEEE Trans. Pattern Anal. Mach._, 2024.

[5] D. Hafner _et al._, “Mastering atari with discrete world models,” _arXiv_
_preprint arXiv:2010.02193_, 2020.

[6] C. Zhao _et al._, “Generative AI for secure physical layer communications:
A survey,” _IEEE Trans. Cogn. Commun. Netw._, 2024.

[7] C. Zhao _et_ _al._, “Generative AI-enabled wireless communications for robust low-altitude economy networking,” _arXiv preprint_
_arXiv:2502.18118_, 2025.

[8] L. U. Khan _et al._, “Digital twin of wireless systems: Overview, taxonomy, challenges, and opportunities,” _IEEE Commun. Surv. Tut._, vol. 24,
no. 4, pp. 2230–2254, 2022.

[9] M. Xu _et al._, “A full dive into realizing the edge-enabled metaverse:
Visions, enabling technologies, and challenges,” _IEEE Commun. Surv._
_Tut._, vol. 25, no. 1, pp. 656–700, 2022.

[10] R. Bommasani _et al._, “On the opportunities and risks of foundation
models,” _arXiv preprint arXiv:2108.07258_, 2021.

[11] D. Ha and J. Schmidhuber, “World models,” _arXiv_ _preprint_
_arXiv:1803.10122_, 2018.

[12] X. Wang _et al._, “Worlddreamer: Towards general world models
for video generation via predicting masked tokens,” _arXiv preprint_
_arXiv:2401.09985_, 2024.

[13] S. Hao _et al._, “Reasoning with language model is planning with world
model,” _arXiv preprint arXiv:2305.14992_, 2023.

[14] K. Li _et al._, “On-board deep Q-network for UAV-assisted online power
transfer and data collection,” _IEEE Trans. Veh. Technol._, vol. 68, no. 12,
pp. 12 215–12 226, 2019.

[15] N. Chen _et al._, “Wind power forecasts using gaussian processes and
numerical weather prediction,” _IEEE Trans. Power Syst._, vol. 29, no. 2,
pp. 656–665, 2013.

