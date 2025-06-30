## **Control-R: Towards controllable test-time scaling**

**Di Zhang** **[1, 2]** **, Weida Wang** **[3, 2]** **, Junxian Li** **[4]** **, Xunzhi Wang** **[5]** **, Jiatong Li** **[6]** **,**
**Jianbo Wu** **[7]**, **Jingdi Lei** **[2]**, **Haonan He** **[8]**, **Peng Ye** **[2]**, **Shufei Zhang** **[2]**,
**Wanli Ouyang** **[2]**, **Yuqiang Li** **[2]**, **Dongzhan Zhou** **[2]**

1 Fudan University, 2 Shanghai Artificial Intelligence Laboratory, 3 Tongji University,
4 Shanghai Jiaotong University, 5 Nankai University, 6 Hong Kong Polytechnic University,
7 University of California, Merced, 8 University of Science and Technology of China,

**Correspondence:** [di.zhang@ustc.edu](mailto:di.zhang@ustc.edu)


**Abstract**

This paper target in addressing the challenges
of underthinking and overthinking in long
chain-of-thought (CoT) reasoning for Large
Reasoning Models (LRMs) by introducing Reasoning Control Fields (RCF)—a novel test-time
approach that injects structured control signals
to guide reasoning from a tree search perspective. RCF enables models to adjust reasoning effort according to given control conditions
when solving complex tasks. Additionally, we
present the Control-R-4K dataset, which consists of challenging problems annotated with
detailed reasoning processes and corresponding control fields. To further enhance reasoning control, we propose a Conditional Distillation Finetuning (CDF) method, which trains
models—particularly Control-R-32B—to effectively adjust reasoning effort during test
time. Experimental results on benchmarks
such as AIME2024 and MATH500 demonstrate

that our approach achieves state-of-the-art performance at the 32B scale while enabling a
controllable Long CoT reasoning process (LCoT). Overall, this work introduces an effective
paradigm for controllable test-time scaling reasoning.

**1** **Introduction**

_“The two methods that seem to scale arbitrarily in_
_this way are search and learning.”_

—
_Rich Sutton, The Bitter Lesson_
Recent advancements in large reasoning models (LRMs), such as DeepSeek-R1 (DeepSeek-AI
et al., 2025), QwQ-32B (Zheng et al., 2024), and
the OpenAI O1 Series (Jaech et al., 2024), have
enabled LRMs to perform reasoning on par with
human experts in fields like mathematics and programming. However, existing LRMs still face the
challenge of handling long chain-of-thought (LCoT) reasoning. On one hand, LRMs might fail to
fully explore all the possible solutions due to the
inherent complexity of the problem, namely **under-**
















Figure 1: The main idea of Control-R.

**thinking** . On the other hand, there is still a chance
that LRMs engage and stuck in redundant or excessive reasoning, also known as **overthinking** (Kumar et al., 2025; Wang et al., 2025; Anderson et al.,
2025).
As shown in Figure 1, in the scenario of **un-**
**derthinking**, LRMs tend to rush to a conclusion,
without exploring all potential avenues. This shallow reasoning process, characterized by a lack of
self-questioning and reflection, may lead the model
to overlook potential errors. Conversely, when the
model over-elaborates on its reasoning, repeating
arguments in an attempt to cover every possible scenario, it falls into **overthinking** . Such overthinking not only consumes excessive computational
resources but also reduces the overall efficiency
and the quality of the final decision.
Inspired by the ideas of controllable conditional
generation behind SteerLM (Dong et al., 2023),
we propose the Reasoning Control Fields (RCFs)
technique as a novel feasible solution. The core


1

concept of RCF is to inject structured control fields
into the model during the test-time, thereby enabling efficiency control of the chain-of-thought
depth and efficiency. By considering L-CoT reasoning as analogous to a search tree, we decompose
both **execution control** and the **quality evaluation**
of the reasoning process into several attributes, resulting in the definition of 11 distinct RCFs. Each
RCF acts as a switch or regulator that guides the
model on the extent to which it should engage in
strategies such as exhaustive search (Wang et al.,
2024a), backtracking (Singh et al.), or self-refine
during its reasoning process (Zhang et al., 2024).
To enable the model to effectively utilize these
RCFs, we have constructed a novel, high-quality
dataset for L-CoT reasoning, Control-R-4K. This
dataset is specifically designed to enhance the
model’s search capabilities, providing a range of
challenging problems such as _24-point game sce-_
_narios_, _advanced calculus calculations_, and _differ-_
_ential equation solving_ . Moreover, the dataset is
meticulously annotated to ensure clarity and consistency. Each problem is accompanied by detailed
reasoning process annotations as well as corresponding control field specifications, making it a
comprehensive resource for developing and refining the model’s reasoning abilities. During training,
the model learns to distinguish when deep reasoning is necessary and when redundant steps can be
omitted.

To further enhance this adaptability, we introduce Conditional Distillation Finetuning (CDF),
where the model is trained with both task content

and RCFs that guides its reasoning process from
tree search perspective. This enables the model to
effectively adjust its chain-of-thought depth and
strategy based on specified conditions. during test
time, users can define control field parameters, allowing the model to adjust reasoning depth and
efficiency in test-time.
Experimental results on benchmarks like
AIME2024 (Patel et al., 2024) and MATH500
(Lightman et al., 2023a) show that Control-R-32B
with RCFs achieve state-of-the-art (SOTA) performance by enhancing search efficiency and reasoning quality. RCFs modulates reasoning effort during test time, which allows users to balance reasoning depth and efficiency dynamically, enabling
models to engage in deeper reasoning, reflection,
and evidence gathering for complex tasks while
streamlining reasoning in simpler cases by reducing redundant steps.


Overall, our main contributions are as follows:

1. We propose Reasoning Control Field (RCF)
method, which leverages a structured control
fields at the test-time of LRMs to efficiently
control the long chain-of-thought reasoning.

2. We also introduce the Control-R-4K dataset,
featuring questions that require Long chainof-thought reasoning along with curated reasoning control field annotations to support effective model distillation.

3. Finally, we propose and leverage Conditional
Distillation Finetuning (CDF) for the training of LRMs. Experimental results show
that our trained Control-R-32B demonstrated

a competitive reasoning ability through controllable and interpretable Long Chain-ofThought resoning process.

**2** **Method**

**2.1** **Attributes from a Perspective of Tree**
**Search Process**

To control the reasoning effort of LRMs, we propose the RFC technique, which is inspired by the
idea behind SteerLM (Dong et al., 2023). Specifically, our core idea is based on treating the Long
CoT (Jaech et al., 2024) reasoning process of models as an In-Context Tree Search (ICTS) (Rubin
et al., 2021) process. From this perspective, the LCoT reasoning process of large reasoning models
can be interpreted as a search tree _τ_ ( _q_ ) for a given
input query _q_, where the large reasoning model
generates a L-CoT response _R_ = ( _r_ 1 _, r_ 2 _, . . ., r_ _n_ ) .
This reasoning process can be formalized as a
search tree _τ_ ( _q_ ) with the following properties:

  - Each reasoning step _r_ _i_ corresponds to a node
_N_ _i_ in the search tree _τ_ ( _q_ ).

  - Different reasoning strategies, such as divideand-conquer, strategy switching, and error correction methods, influence the selection of exploration paths and nodes to expanse.

  - Error detection and correction are analogous
to backtracking and node selection in tree
search process, ensuring the quality and completeness of the L-CoT response _R_ .

Then we define a set of structured RCFs based
on the topology and time-varying characteristics
and qualitative metrics of the search tree _τ_ ( _q_ ) . As
shown in Figure 2, these reasoning control fields
are categorized into two broad types: **Execution**
**control metrics** describe how the model control the


2

Search Depth Search Breadth


**11** **Reasoning**

**Control Fields**





Error Detetction Error Correction Strategy Switching



~~R~~ eason ~~i~~ ng ~~Effi~~ c ~~i~~ ency Logical Coherence ~~S~~ earc ~~h~~ ~~C~~ omp ~~l~~ e ~~t~~ eness




Final Correctness


Knowledge Accuracy Reasoning Clarity





Figure 2: For the explanation of 11 Reasoning Control Fields. The red L-CoT represents the tree of thought with
low score in this metric, and the blue L-CoT indicates the high score. The ~~red~~ box represents Execution Control

fields, while the ~~blue~~ box represents Process Quality Metrics fields.


execution flow of search process. **Process quality**
**metrics** assess the quality of the steps and connections in search process. Both types of metrics adopt
integer scores ranging from 0 to 9, with 0 being the
lowest and 9 the highest.

**2.1.1** **Execution Control Metrics**

**Search depth** gauges the extent of exploration
of reasoning. A shallow search (score of 0) signifies minimal, superficial steps, while a deep
search (score of 9) involves multi-layered reasoning—employing techniques like recursion and
divide-and-conquer—to unravel complex causal
relationships.
**Search breadth** measures the ability to explore
multiple possibilities simultaneously. A narrow
approach (score of 0) follows a single and linear
path, whereas a broad search (score of 9) systematically compares various solutions using methods
such as classification, discussion, and dialectical
reasoning.
**Error detection** reflects the sensitivity to identify
mistakes. A low score (0) indicates a tendency
to overlook errors or misclassify correct information as faulty, while a high score (9) is achieved
through rigorous self-checks and accurate and frequent identification of errors.
**Error correction** evaluates how effectively the system rectifies identified mistakes. Minimal corrective action (score of 0) can lead to compounding errors, whereas a high level of error correction (score


of 9) is marked by active backtracking and iterative
adjustments that ensure precision.
**Strategy switching** assesses the flexibility in adapting the search process. Ineffective strategy switching (score of 0) may result in erratic changes or
an inflexible adherence to one method, while optimal strategy switching (score of 9) involves targeted shifts between various approaches to enhance
search efficiency and overall solution quality.

**2.1.2** **Process Quality Metrics**

**Final correctness** measures how accurately the
conclusion aligns with established facts or the standard solution. A score of 0 indicates major errors and a severe deviation from accepted answers,
while a score of 9 reflects complete accuracy and
high reliability.
**Reasoning efficiency** evaluates the use of resources and steps during the problem-solving process. A score of 0 suggests excessive, redundant
work and inefficient use of resources, whereas a
score of 9 signifies that high-quality results were
achieved with minimal steps and optimal focus.
**Search completeness** examines whether all critical
conditions, arguments, and steps are addressed. A
score of 0 denotes significant omissions, while a
score of 9 confirms that all essential elements were
thoroughly considered.
**Logical coherence** reviews the consistency and
rigor of the reasoning process. A score of 0 is given
when the reasoning is contradictory or confused,


3

whereas a score of 9 indicates a tightly connected,
well-structured, and internally consistent argument.
**Knowledge accuracy** focuses on the correctness
of the facts, concepts, or theories referenced. A
score of 0 points to multiple errors or heavy hallucinations, while a score of 9 demonstrates a precise
and solid grasp of the relevant knowledge or facts.
**Reasoning clarity** assesses how clearly the reasoning is presented. A score of 0 indicates a chaotic
or confusing explanation with missing steps, and a
score of 9 reflects a logically sound, well-organized
presentation that is easy to follow.

**2.2** **Reasoning Control Fields**

Inspired by SteerLM, we adopt the concept of conditional generation in probability theory by introducing attribute control information at each token
generation step. This approach ensures that the generated content is not merely a response to the input
prompt but also adheres to predefined structured
attribute fields requirements, forming high-quality
reasoning process. To achieve this, we introduce a
structured reasoning control fields. Given a reasoning task _q_ with a corresponding reasoning process
_R_, we represent the attribute requirements during
reasoning or search as a structure of reasoning control fields _C_, which comprises eleven predefined
metrics that define attribute information throughout
the L-CoT reasoning process.
From a probabilistic perspective, without additional constraints, the model generates the reasoning process _R_ = ( _r_ 1 _, r_ 2 _, . . ._ ) step by step freely,
where each token depends solely on the previously
generated tokens. The probability of generating the
entire reasoning process can be expressed as:


the control fields _C_, thereby enabling a control on
the model’s long chain-of-thoutht reasoning pro
cess.

**Attribute Annotation:** To systematically describe the Reasoning Control Fields (RCFs) in long
Chain-of-Thought (L-CoT) reasoning processes,
we introduce a structured attribute annotation for
mat. This structured representation allows for detailed evaluation and assessment over different as
pects of reasoning. The annotation is defined as
following example:

{
"analysis": {
"execution_control_scores": {
"search_depth": 8,
"search_breadth": 7,
"error_detection": 8,
"error_correction": 7,
"strategy_switching": 6
},
"quality_evaluation_scores": {
"correctness": 9,
"efficiency": 7,
"completeness": 8,
"coherence": 8,
"knowledge_accuracy": 9,
"clarity_of_steps": 8
},
"justification": "The reasoning..."
}
}

As illustrated in Figure 3, to obtain reasoning
attribute annotation in this format, we prompted
ChatGPT-4o to annotate Long Chain-of-Thoughts
reasoning processes generated by state-of-the-art
large reasoning models, including DeepSeek-R1,
QwQ-32B, and Gemini-2-Flash-Thinking. These
structured annotations form serve as the control

signal in our proposed distillation training method,
ensuring models can learn to control of reasoning
behaviors accordingly.
To integrate these control signals into model
training, we thus convert the structured attribute annotations into a textual format, referred to as reasoning control fields (RCFs) strings. These fields are
then appended to the user query as a guiding constraint for reasoning process in the training dataset:

"\n<control> search_depth: 8; search_breadth:
7; error_detection: 8; error_correction: 7;
strategy_switching: 6; correctness: 9;
efficiency: 7; completeness: 8; coherence: 8;
knowledge_accuracy: 9; clarity_of_steps: 8
<control/>"

During training time, the model learns to incorporate these RCFs strings as constraints as discussed in (2), ensuring that the generated reasoning


_P_ ( _R | q_ ) =


_T_
� _P_ ( _r_ _t_ _| r_ 1 _, r_ 2 _, . . ., r_ _t−_ 1 _, q_ ) _._ (1)

_t_ =1


When the reasoning control fields _C_ is introduced, we require that the generated reasoning process not only matches the task _Q_ but also satisfies
the attribute requirements defined in reasoning control fields _C_ . Thus, the generation process becomes
conditional on both _Q_ and _C_, and the probability of
model’s generation process is modified as follows:


_P_ ( _R | q, C_ ) =


_T_
� _P_ ( _r_ _t_ _| r_ 1 _, r_ 2 _, . . ., r_ _t−_ 1 _, q, C_ ) _._ (2)

_t_ =1


This equation indicates that each token _r_ _t_ is generated based on the previously generated tokens,
the query of task _q_, and the attributes specified in


4

|Col1|Search Depth<br>Search Breadth<br>Error Detection<br>Error Correction<br>Strategy Switching|9<br>6<br>1<br>3<br>7|
|---|---|---|
||||
||Final Correctness<br>Reasoning Efficiency<br>Search Completeness<br>Logical Coherence<br>Knowledge Accuracy<br>Reasoning Clarity|9<br>9<br>9<br>9<br>9<br>9|


Figure 3: The overall pipeline of Control-R.


processes align with both the query requirements
and the predefined reasoning attributes. For details
of the prompting strategies used to obtain these
annotations, refer to Appendix A. Additionally,
the dataset employed in the annotation process,
Control-R-4K, is described in Appendix B.

**2.3** **Conditional Distillation Fine-tuning**

To effectively teach the model to reason in the Long
Chain-of-Thought style while adhering to the specific conditions of appended RCFs string, we applied Conditional Distillation Fine-tuning (CDF)
using our newly curated Control-R-4K dataset.
Given a query _q_, the model generates a reasoning process _R_, which consists of a sequence of
reasoning steps:

_R_ = _{r_ 1 _, r_ 2 _, . . ., r_ _n_ _},_ _r_ _i_ _∈R,_ (3)

where _R_ is the space of all possible reasoning steps.
Each reasoning process _R_ can be annotated with an
reasoning control field _C_, a textual representation
of different reasoning attributes:

_C_ = ( _c_ 1 _, c_ 2 _, . . ., c_ _k_ ) _∈C_ _[k]_ _,_ (4)

where _k_ is the number of distinct control attributes.

Thus, a fully annotated reasoning process can be
represented as ( _q, R, C_ ).
A key challenge in directly training the model
on multiple annotated processes is the potential
for conflicts between different reasoning strategies
for the same query. Formally, given a dataset _D_


consisting of multiple valid reasoning processes for
the same query:

_D_ = _{_ ( _q, R_ 1 _, C_ 1 ) _,_ ( _q, R_ 2 _, C_ 2 ) _, . . .,_ ( _q, R_ _m_ _, C_ _m_ ) _},_ (5)

where _q_ is fixed, but _R_ _i_ _̸_ = _R_ _j_ for _i ̸_ = _j_, the model
may struggle to reconcile different reasoning styles
described by _C_ _i_ _̸_ = _C_ _j_, leading to inconsistent behavior when no explicit control field is provided
during inference.
To address this, we introduce Conditional Distillation Fine-tuning (CDF), which conditions the
model on attribute control fields _C_ to ensure that it
learns controllable reasoning processes rather than
arbitrarily averaging multiple reasoning styles. The
training objective for CDF is formulated as:


,
where _P_ ( _r_ _i_ _| r_ _<i_ _, q, C_ ; _θ_ ) is the probability assigned by the model which parameterized by _θ_
to the next reasoning step _r_ _i_, given the previous
steps and the control field _C_ . This ensures that the
model explicitly conditions on _C_ when generating
reasoning processes, leading to a controllable and
interpretable L-CoT reasoning process.

**3** **Results**

**3.1** **Evaluation Settings**

We fine-tuned the Qwen2.5-32B-Instruct model
using the Control-R-4K dataset, resulting in the





(6)



_L_ CDF = E


 _−_


_|R|_
�


� log _P_ ( _r_ _i_ _| r_ _<i_ _, q, C_ ; _θ_ )

_i_ =1


5

AIME2024

70.0

GPQA- 61.6 93.2 MATH500
Diamond

Control-R-32B(Ours)
Bespoke-Stratos-32B
Sky-T1-32B
DeepSeek-R1-Distill-Qwen-32B
OpenThinker-32B

Figure 4: Radar chart of experiments results on cuttingedge competition benchmarks.

Control-R-32B model. For hyper-parameter setting in training, please refer to Appendix C. Subsequently, we evaluated this model based on the
following prompting strategy:
**Generation:** The system prompt is set to an empty
string, while the user prompt consists of the original question, followed by control fields and an
inference prompt as shown below:

\n<control> search_depth: 9; search_breadth: 9;
error_detection: 9; error_correction: 9;
strategy_switching: 9; correctness: 9;
efficiency: 9; completeness: 9;
coherence: 9; knowledge_accuracy: 9;
clarity_of_steps: 9 <control/>
Please reason step by step, and put your final
answer within \\boxed{}.

Notably, following the suggestion of DeepSeek
research team (Guo et al., 2025), we incorporate
the following forced generation prompt to avoid
the model’s tendency to skip reasoning process:

<think>\n

**Grading:** We first extract the predicted answers
from the model’s responses using regular expressions. Then, we employ the grading tool from
PRM800K(Lightman et al., 2023a) to assess the
equivalence between the predicted and ground truth
answers. If extraction fails or the answers are

deemed non-equivalent, the response is marked
as incorrect.

**Metric:** All performance metrics are computed
using the Pass@1 metric (Chen et al., 2021), which
is defined as:


where _n_ is the number of sampled responses, and _c_
is the number of correct responses.

**3.2** **Main Result**

**On cutting-edge competition benchmarks.** As
shown in Table 1, Control-R-32B (Ours) demonstrates a strong performance across benchmarks,
excelling in mathematical reasoning.
In AIME2024, it achieves 70.0%, outperforming Bespoke-Stratos-32B (63.3%) and Sky-T132B (43.3%) but trailing DeepSeek-R1 (79.8%).
In MATH500, it leads with 93.2%, surpassing
OpenThinker-32B (90.6%) and Bespoke-Stratos32B (93.0%), while DeepSeek-R1 (97.3%) scores
highest. And in GPQA-Diamond, it scores 61.1%,
outperforming Bespoke-Stratos-32B (58.1%) and
Sky-T1-32B (56.8%), but lags behind models with
larger parameter sizes such as o1-preview (75.2%)
and DeepSeek-R1 (71.5%).
In conclusion, Control-R-32B achieves SOTA
performance on MATH500 and AIME2024 at 32B
scale while remaining competitive in other tasks.
It demonstrates stable performance, whereas some
models excel in specific benchmarks but underperform elsewhere. Future work should enhance its

performance for improved complex reasoning in
scientific areas.
**On latest uncontaminated competition bench-**
**marks.** To analyze the performance of the model
on the latest evaluation benchmarks that are least

contaminated by pretraining data, we conducted
tests and comparisons on AIME2025 Part I. As
shown in Table A2, Control-R-32B (Ours) achieved
an average accuracy of 55% in the AIME2025 Part
I benchmark. While it demonstrated strong performance in certain tasks, there remains significant
room for improvement.
Control-R-32B exhibited performance comparable to the closed-source model Gemini-2.0-Flash
Thinking (51.67%), though differences were observed across individual tasks. Compared with
similar parameter size models such as QwQ32B (36.67%), Control-R-32B demonstrated competitive experimental results. Compared to
traditional LLMs, Control-R-32B outperformed
DeepSeek-V3 (28.33%), Gemini-2.0-Flash (30%),
and Claude-3.5-Sonnet (3.33%), demonstrating a
certain level of competitiveness.
In summary, Control-R-32B exhibits a certain
level of competitiveness and performs well on similar parameter sizes, but there remains considerable
room for improvement. By optimizing training


�


pass@ _k_ := E
Problems


�


1 _−_


� _n−k_ _c_ �
� _nk_ �


6

**Cutting-edge** **Uncontaminated**
**Model**

AIME2024 MATH500 GPQA-Diamond AIME2025 Part I

Bespoke-Stratos-32B 63.3 93.0 58.1         Sky-T1-32B 43.3 82.4 56.8         DeepSeek-R1-Distill-Qwen-32B 66.7 89.8 61.1 53.3
OpenThinker-32B 66.0 90.6 61.6 53.3

Control-R-32B(Ours) 70.0 93.2 61.1 55.0

o1-preview 40.0 81.4 **75.2** **78.3**
DeepSeek-R1 **79.8** **97.3** 71.5 65.0

Table 1: Experiments on cutting-edge benchmarks, including AIME2024, MATH500, GPQA-Diamond, and
AIME2025 Part I. The metric is Pass@1 (n=1). Reported results cited from Bespoke-Stratos Project (Bespoke_Labs,
2025).


strategies, enhancing reasoning capabilities, and
improving generalization in future works, it is expected to narrow the gap with the O3 and O1 series,
further enhancing overall performance.

**3.3** **Ablation Study**

**A Statistical Perspective on the L-CoT Reason-**
**ing Process.** Table 2 examines token length and
"Wait" occurrences across different datasets to ex
plore their impact on reasoning correctness. The
results highlight key trends that can inform model
optimization.
Correct answers generally involve longer token
sequences, particularly in Math500 and GPQADiamond, where correct responses have significantly greater average token lengths (1687.64 vs.
281.59 and 806.42 vs. 654.13, respectively). However, this trend reverses in AIME2025, where incorrect answers are longer (154.79 vs. 41.05), suggesting that excessive token generation in complex
tasks may indicate redundant computation or reasoning errors, aligning with prior findings (Muennighoff et al., 2025).
"Wait" occurrences also impact correctness. In
GPQA-Diamond, correct answers exhibit slightly
higher average "Wait" occurrences (7.02 vs. 6.53),
suggesting that moderate pauses may improve precision. However, in AIME2025, correct answers
have minimal "Wait" occurrences (0.14 vs. 1.1),
indicating that fluency is more critical in simpler
tasks. Additionally, incorrect reasoning often involves extreme "Wait" occurrences, as seen in
GPQA-Diamond and AIME2024, where incorrect
responses exhibit substantially higher maximum
wait occurrences (315 vs. 226 and 255 vs. 160),
reflecting inefficiencies or inference loops.
In summary, longer token sequences and moderate pauses generally enhance accuracy, but their
effects depend on task complexity. Future optimiza

tions should tailor reasoning strategies to different
problem types, balancing thoroughness and efficiency.
**On the impact of reasoning control fields:** As
Shown in Table 3, we examine the impact of reasoning control fields on the model’s L-CoT performance by comparing Qwen2.5-32B-Instruct and
Control-R-32B on AIME2024 and MATH500.

Control-R-32B without control fields performs significantly worse (AIME2024: 6.67%,
MATH500: 3.2%) than the baseline Qwen2.532B-Instruct, highlighting the necessity of control
fields. With control fields set to 0 or 5, Control-R32B achieves 63.3% on AIME2024 and 91.6%

on MATH500, showing minimal sensitivity in
MATH500 but a notable impact on AIME2024.
Setting the fields to 9 (Ours) further improves performance to 70.0% on AIME2024 and 93.2% on

MATH500, indicating that optimized control configurations enhance reasoning performance. These
results suggest that AIME2024 is more sensitive to
control field configurations than MATH500. These
findings underscore the need for task-specific control strategies to maximize model performance in
future studies.

**4** **Related Work**

**Reasoning with LLMs.** Recent language models
have seen great success in solving math, physics or
other complex reasoning problems (Brown et al.,
2020; Touvron et al., 2023; Hoffmann et al., 2022;
Chiang et al., 2023). To enhance reasoning ability of LLMs, instead of making the models generate a single answer directly, previous works
have designed a step-by-step reasoning framework
through specially designed instructions. Chainof-Thought (Wei et al., 2022) and others (Kojima
et al., 2022; Wang et al., 2023) are some of the rep

7

**Token Length** **Wait Occurrence Times**
**Dataset** **Outcome**

**Longest** **Shortest** **Avg** **Most** **Least** **Avg**

Correct 24375 611 1687.64 123 0 5.64
Math500
Wrong 21167 1232 281.59 131 2 1.74

Correct 21740 377 806.42 226 0 7.02
GPQA-Diamond
Wrong 26155 558 654.13 315 0 6.53

Correct 22980 2024 185.61 160 5 1.05
AIME2024
Wrong 22315 6859 173.55 255 32 1.60

Correct 9179 1637 41.05 38 2 0.14
AIME2025
Wrong 26585 4617 154.79 250 34 1.10

Table 2: Summary of Token Length and "Wait" Occurrence for Different Datasets


**Model** **AIME2024** **MATH500**

Qwen2.5-32B-Instruct 13.3 81.6

Control-R-32B without
6.67 3.2
control fields

Control-R-32B with
63.3 91.4
control fields (all set to 0)

Control-R-32B with
63.3 91.8
control fields (all set to 5)

Control-R-32B with
**70.0** **93.2**
control fields (all set to 9, Ours)

Table 3: Ablation study on the affection of reasoning
control fields

resentative ones. To further improve the reasoning
process, some recent works focus on preference
optimization (Lai et al., 2024; Pang et al., 2024;
Lahlou et al., 2024), involving tree-based searching
methods (Xie et al., 2024; Zhang et al., 2024), or
adding self-evaluation or verification to the reasoning steps (Weng et al., 2023; Xie et al., 2023). Compared to these works, our method adopt a special
attributed conditional method for data construction

and training. This makes sure controllable test-time
scaling.

**Attributed Conditional Training.** In this paper
we include an attributed conditional distillation

method for training. The exploration of attriubted
conditioning is widely used in controllable image
generation (Abdal et al., 2021). Similar idea in supervised fine-tuning in LLMs is firstly introduced
by (Dong et al., 2023), which ensure users to control responses during inference. For this purpose,
special datasets (Wang et al., 2024c,b)are proposed.
In our paper, we take the idea of attributed conditional training and propose new methods for enhancing controllable reasoning.


**5** **Conclusion**

In this paper, we introduced Reasoning Control
Fields (RCF), a test-time approach that injects
structured control signals to adjust the long chainof-thought reasoning process of LRMs. Our contributions include the high-quality Control-R-4K
dataset and the Conditional Distillation Finetun
ing (CDF) strategy, and the Control-R-32B model,
which can adjust reasoning efforts according to
given reasoning control fields. Experimental results
on benchmarks like AIME2024 and MATH500

shows that Control-R-32B with RCF not only
achieves state-of-the-art performance at the 32B
scale, but also generate a controllable and intepretable L-CoT reasoning process.

**Limitations**

While our proposed approach demonstrates strong
performance in structured reasoning tasks, several
areas warrant further exploration:

**Generalization to Open-Domain Reasoning:**

Our method has been validated on mathematical

and logical benchmarks, but its effectiveness in
open-domain scenarios (e.g., commonsense, scientific, and legal reasoning) remains to be explored.

**Fine-Grained Control Calibration:** While con
trol fields offer flexibility, selecting optimal values
for different tasks may require manual tuning. Future work could explore adaptive mechanisms for
automated calibration.

**Evaluation Scope:** Our experiments focus on
key reasoning benchmarks, but broader validation
on diverse datasets, including real-world and adversarial tasks, would provide a more comprehensive
assessment of robustness and applicability.


8

**References**

Rameen Abdal, Peihao Zhu, Niloy J Mitra, and Peter Wonka. 2021. Styleflow: Attribute-conditioned
exploration of stylegan-generated images using
conditional continuous normalizing flows. ACM
Transactions on Graphics (ToG), 40(3):1–21.

Carolyn Jane Anderson, Joydeep Biswas, Aleksander
Boruch-Gruszecki, Federico Cassano, Molly Q Feldman, Arjun Guha, Francesca Lucchetti, and Zixuan
Wu. 2025. Phd knowledge not required: A reasoning
challenge for large language models. arXiv preprint
arXiv:2502.01584.

Bespoke_Labs. 2025. Bespoke-stratos: The unreasonable effectiveness of reasoning distillation.
https://www.bespokelabs.ai/blog/bespoke-stratosthe-unreasonable-effectiveness-of-reasoningdistillation. Accessed: 2025-01-22.

Tom B Brown, Benjamin Mann, Nick Ryder, Melanie
Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind
Neelakantan, Pranav Shyam, Girish Sastry, Amanda
Askell, et al. 2020. Language models are
few-shot learners. In Proceedings of the 34th
International Conference on Neural Information
Processing Systems, pages 1877–1901.

Mark Chen, Jerry Tworek, Heewoo Jun, Qiming
Yuan, Henrique Ponde De Oliveira Pinto, Jared Kaplan, Harri Edwards, Yuri Burda, Nicholas Joseph,
Greg Brockman, et al. 2021. Evaluating large
language models trained on code. arXiv preprint
arXiv:2107.03374.

Wei-Lin Chiang, Zhuohan Li, Zi Lin, Ying Sheng,
Zhanghao Wu, Hao Zhang, Lianmin Zheng, Siyuan
Zhuang, Yonghao Zhuang, Joseph E Gonzalez, et al.
2023. Vicuna: An open-source chatbot impressing
gpt-4 with 90%* chatgpt quality. See https://vicuna.
lmsys. org (accessed 14 April 2023), 2(3):6.

Tri Dao. 2023. Flashattention-2: Faster attention with
better parallelism and work partitioning. arXiv
preprint arXiv:2307.08691.

DeepSeek-AI, Daya Guo, Dejian Yang, Haowei Zhang,
Junxiao Song, Ruoyu Zhang, Runxin Xu, Qihao Zhu,
Shirong Ma, Peiyi Wang, Xiao Bi, Xiaokang Zhang,
Xingkai Yu, Yu Wu, Z. F. Wu, Zhibin Gou, Zhihong
Shao, Zhuoshu Li, Ziyi Gao, Aixin Liu, Bing Xue,
Bingxuan Wang, Bochao Wu, Bei Feng, Chengda Lu,
Chenggang Zhao, Chengqi Deng, Chenyu Zhang,
Chong Ruan, Damai Dai, Deli Chen, Dongjie Ji,
Erhang Li, Fangyun Lin, Fucong Dai, Fuli Luo,
Guangbo Hao, Guanting Chen, Guowei Li, H. Zhang,
Han Bao, Hanwei Xu, Haocheng Wang, Honghui
Ding, Huajian Xin, Huazuo Gao, Hui Qu, Hui Li,
Jianzhong Guo, Jiashi Li, Jiawei Wang, Jingchang
Chen, Jingyang Yuan, Junjie Qiu, Junlong Li, J. L.
Cai, Jiaqi Ni, Jian Liang, Jin Chen, Kai Dong, Kai
Hu, Kaige Gao, Kang Guan, Kexin Huang, Kuai
Yu, Lean Wang, Lecong Zhang, Liang Zhao, Litong
Wang, Liyue Zhang, Lei Xu, Leyi Xia, Mingchuan
Zhang, Minghua Zhang, Minghui Tang, Meng Li,


Miaojun Wang, Mingming Li, Ning Tian, Panpan
Huang, Peng Zhang, Qiancheng Wang, Qinyu Chen,
Qiushi Du, Ruiqi Ge, Ruisong Zhang, Ruizhe Pan,
Runji Wang, R. J. Chen, R. L. Jin, Ruyi Chen,
Shanghao Lu, Shangyan Zhou, Shanhuang Chen,
Shengfeng Ye, Shiyu Wang, Shuiping Yu, Shunfeng
Zhou, Shuting Pan, S. S. Li, Shuang Zhou, Shaoqing
Wu, Shengfeng Ye, Tao Yun, Tian Pei, Tianyu Sun,
T. Wang, Wangding Zeng, Wanjia Zhao, Wen Liu,
Wenfeng Liang, Wenjun Gao, Wenqin Yu, Wentao
Zhang, W. L. Xiao, Wei An, Xiaodong Liu, Xiaohan
Wang, Xiaokang Chen, Xiaotao Nie, Xin Cheng, Xin
Liu, Xin Xie, Xingchao Liu, Xinyu Yang, Xinyuan Li,
Xuecheng Su, Xuheng Lin, X. Q. Li, Xiangyue Jin,
Xiaojin Shen, Xiaosha Chen, Xiaowen Sun, Xiaoxiang Wang, Xinnan Song, Xinyi Zhou, Xianzu Wang,
Xinxia Shan, Y. K. Li, Y. Q. Wang, Y. X. Wei, Yang
Zhang, Yanhong Xu, Yao Li, Yao Zhao, Yaofeng
Sun, Yaohui Wang, Yi Yu, Yichao Zhang, Yifan Shi,
Yiliang Xiong, Ying He, Yishi Piao, Yisong Wang,
Yixuan Tan, Yiyang Ma, Yiyuan Liu, Yongqiang Guo,
Yuan Ou, Yuduan Wang, Yue Gong, Yuheng Zou, Yujia He, Yunfan Xiong, Yuxiang Luo, Yuxiang You,
Yuxuan Liu, Yuyang Zhou, Y. X. Zhu, Yanhong Xu,
Yanping Huang, Yaohui Li, Yi Zheng, Yuchen Zhu,
Yunxian Ma, Ying Tang, Yukun Zha, Yuting Yan,
Z. Z. Ren, Zehui Ren, Zhangli Sha, Zhe Fu, Zhean
Xu, Zhenda Xie, Zhengyan Zhang, Zhewen Hao,
Zhicheng Ma, Zhigang Yan, Zhiyu Wu, Zihui Gu, Zijia Zhu, Zijun Liu, Zilin Li, Ziwei Xie, Ziyang Song,
Zizheng Pan, Zhen Huang, Zhipeng Xu, Zhongyu
[Zhang, and Zhen Zhang. 2025. Deepseek-r1: Incen-](https://arxiv.org/abs/2501.12948)
[tivizing reasoning capability in llms via reinforce-](https://arxiv.org/abs/2501.12948)
[ment learning. Preprint, arXiv:2501.12948.](https://arxiv.org/abs/2501.12948)

Yi Dong, Zhilin Wang, Makesh Sreedhar, Xianchao Wu,
and Oleksii Kuchaiev. 2023. Steerlm: Attribute conditioned sft as an (user-steerable) alternative to rlhf.
In Findings of the Association for Computational
Linguistics: EMNLP 2023, pages 11275–11288.

Daya Guo, Dejian Yang, Haowei Zhang, Junxiao Song,
Ruoyu Zhang, Runxin Xu, Qihao Zhu, Shirong Ma,
Peiyi Wang, Xiao Bi, et al. 2025. Deepseek-r1: Incentivizing reasoning capability in llms via reinforcement learning. arXiv preprint arXiv:2501.12948.

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks,
Johannes Welbl, Aidan Clark, et al. 2022. Training compute-optimal large language models. In
Proceedings of the 36th International Conference
on Neural Information Processing Systems, pages
30016–30030.

Pin-Lun Hsu, Yun Dai, Vignesh Kothapalli, Qingquan
Song, Shao Tang, Siyu Zhu, Steven Shimizu, Shivam
[Sahni, Haowen Ning, and Yanning Chen. 2024. Liger](https://arxiv.org/abs/2410.10989)
[kernel: Efficient triton kernels for llm training.](https://arxiv.org/abs/2410.10989) arXiv
preprint arXiv:2410.10989.

Edward J Hu, Yelong Shen, Phillip Wallis, Zeyuan
Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang,


9

and Weizhu Chen. 2021. Lora: Low-rank adaptation of large language models. arXiv preprint
arXiv:2106.09685.

Aaron Jaech, Adam Kalai, Adam Lerer, Adam Richardson, Ahmed El-Kishky, Aiden Low, Alec Helyar,
Aleksander Madry, Alex Beutel, Alex Carney, et al.
2024. Openai o1 system card. arXiv preprint
arXiv:2412.16720.

Dhiraj Kalamkar, Dheevatsa Mudigere, Naveen Mellempudi, Dipankar Das, Kunal Banerjee, Sasikanth Avancha, Dharma Teja Vooturi, Nataraj Jammalamadaka,
Jianyu Huang, Hector Yuen, et al. 2019. A study of
bfloat16 for deep learning training. arXiv preprint
arXiv:1905.12322.

Diederik P Kingma. 2014. Adam: A method for stochastic optimization. arXiv preprint arXiv:1412.6980.

Takeshi Kojima, Shixiang Shane Gu, Machel Reid, Yutaka Matsuo, and Yusuke Iwasawa. 2022. Large
language models are zero-shot reasoners. In
Proceedings of the 36th International Conference
on Neural Information Processing Systems, pages
22199–22213.

Abhinav Kumar, Jaechul Roh, Ali Naseh, Marzena
Karpinska, Mohit Iyyer, Amir Houmansadr, and
Eugene Bagdasarian. 2025. Overthinking: Slowdown attacks on reasoning llms. arXiv preprint
arXiv:2502.02542.

Salem Lahlou, Abdalgader Abubaker, and Hakim Hacid.
2024. Port: Preference optimization on reasoning
traces. arXiv preprint arXiv:2406.16061.

Xin Lai, Zhuotao Tian, Yukang Chen, Senqiao Yang, Xiangru Peng, and Jiaya Jia. 2024. Step-dpo: Step-wise
preference optimization for long-chain reasoning of
llms. arXiv preprint arXiv:2406.18629.

Hunter Lightman, Vineet Kosaraju, Yura Burda, Harri
Edwards, Bowen Baker, Teddy Lee, Jan Leike,
John Schulman, Ilya Sutskever, and Karl Cobbe.
2023a. Let’s verify step by step. arXiv preprint
arXiv:2305.20050.

Hunter Lightman, Vineet Kosaraju, Yura Burda, Harri
Edwards, Bowen Baker, Teddy Lee, Jan Leike,
John Schulman, Ilya Sutskever, and Karl Cobbe.
2023b. Let’s verify step by step. arXiv preprint
arXiv:2305.20050.

Niklas Muennighoff, Zitong Yang, Weijia Shi, Xiang Lisa Li, Li Fei-Fei, Hannaneh Hajishirzi, Luke
Zettlemoyer, Percy Liang, Emmanuel Candès, and
[Tatsunori Hashimoto. 2025. s1: Simple test-time](https://arxiv.org/abs/2501.19393)
[scaling. Preprint, arXiv:2501.19393.](https://arxiv.org/abs/2501.19393)

Richard Yuanzhe Pang, Weizhe Yuan, Kyunghyun Cho,
He He, Sainbayar Sukhbaatar, and Jason Weston.
2024. Iterative reasoning preference optimization.
arXiv preprint arXiv:2404.19733.


Bhrij Patel, Souradip Chakraborty, Wesley A Suttle, Mengdi Wang, Amrit Singh Bedi, and Dinesh Manocha. 2024. Aime: Ai system optimization via multiple llm evaluators. arXiv preprint
arXiv:2410.03131.

Samyam Rajbhandari, Jeff Rasley, Olatunji Ruwase,
and Yuxiong He. 2020. Zero: Memory optimizations toward training trillion parameter models. In SC20: International Conference for High
Performance Computing, Networking, Storage and
Analysis, pages 1–16. IEEE.

Ohad Rubin, Jonathan Herzig, and Jonathan Berant.
2021. Learning to retrieve prompts for in-context
learning. arXiv preprint arXiv:2112.08633.

Anikait Singh, Kushal Arora, Sedrick Keh, Jean Mercat,
Tatsunori Hashimoto, Chelsea Finn, and Aviral Kumar. Improving the efficiency of test-time search in
llms with backtracking.

[SRI_Lab. 2025. eth-sri/matharena. Original-date: 2025-](https://github.com/eth-sri/matharena)
02-12T19:06:14Z.

Hugo Touvron, Thibaut Lavril, Gautier Izacard, Xavier
Martinet, Marie-Anne Lachaux, Timothée Lacroix,
Baptiste Rozière, Naman Goyal, Eric Hambro,
Faisal Azhar, et al. 2023. Llama: Open and efficient foundation language models. arXiv preprint
arXiv:2302.13971.

Lei Wang, Wanyu Xu, Yihuai Lan, Zhiqiang Hu,
Yunshi Lan, Roy Ka-Wei Lee, and Ee-Peng Lim.
2023. Plan-and-solve prompting: Improving zeroshot chain-of-thought reasoning by large language
models. In Proceedings of the 61st Annual Meeting
of the Association for Computational Linguistics
(Volume 1: Long Papers), pages 2609–2634.

Liang Wang, Nan Yang, Xiaolong Huang, Linjun Yang,
Rangan Majumder, and Furu Wei. 2024a. Large
search model: Redefining search stack in the era of
llms. In ACM SIGIR Forum, volume 57, pages 1–16.
ACM New York, NY, USA.

Yue Wang, Qiuzhi Liu, Jiahao Xu, Tian Liang, Xingyu
Chen, Zhiwei He, Linfeng Song, Dian Yu, Juntao
Li, Zhuosheng Zhang, et al. 2025. Thoughts are all
over the place: On the underthinking of o1-like llms.
arXiv preprint arXiv:2501.18585.

Zhilin Wang, Yi Dong, Olivier Delalleau, Jiaqi
Zeng, Gerald Shen, Daniel Egert, Jimmy J Zhang,
Makesh Narsimhan Sreedhar, and Oleksii Kuchaiev.
2024b. Helpsteer2: Open-source dataset for training top-performing reward models. arXiv preprint
arXiv:2406.08673.

Zhilin Wang, Yi Dong, Jiaqi Zeng, Virginia Adams,
Makesh Narsimhan Sreedhar, Daniel Egert, Olivier
Delalleau, Jane Scowcroft, Neel Kant, Aidan Swope,
et al. 2024c. Helpsteer: Multi-attribute helpfulness
dataset for steerlm. In Proceedings of the 2024
Conference of the North American Chapter of the
Association for Computational Linguistics: Human


10

Language Technologies (Volume 1: Long Papers),
pages 3371–3384.

Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten
Bosma, Brian Ichter, Fei Xia, Ed H Chi, Quoc V Le,
and Denny Zhou. 2022. Chain-of-thought prompting elicits reasoning in large language models. In
Proceedings of the 36th International Conference
on Neural Information Processing Systems, pages
24824–24837.

Yixuan Weng, Minjun Zhu, Fei Xia, Bin Li, Shizhu He,
Shengping Liu, Bin Sun, Kang Liu, and Jun Zhao.
2023. Large language models are better reasoners
with self-verification. In Findings of the Association
for Computational Linguistics: EMNLP 2023, pages
2550–2575.

Yuxi Xie, Anirudh Goyal, Wenyue Zheng, Min-Yen
Kan, Timothy P Lillicrap, Kenji Kawaguchi, and
Michael Shieh. 2024. Monte carlo tree search boosts
reasoning via iterative preference learning. arXiv
preprint arXiv:2405.00451.

Yuxi Xie, Kenji Kawaguchi, Yiran Zhao, James Xu
Zhao, Min-Yen Kan, Junxian He, and Michael Qizhe
Xie. 2023. Self-evaluation guided beam search
for reasoning. In Proceedings of the 37th
International Conference on Neural Information
Processing Systems, pages 41618–41650.

Di Zhang, Xiaoshui Huang, Dongzhan Zhou, Yuqiang
Li, and Wanli Ouyang. 2024. Accessing gpt-4 level
mathematical olympiad solutions via monte carlo
tree self-refine with llama-3 8b. arXiv preprint
arXiv:2406.07394.

Chujie Zheng, Zhenru Zhang, Beichen Zhang, Runji
Lin, Keming Lu, Bowen Yu, Dayiheng Liu, Jin[gren Zhou, and Junyang Lin. 2024. Processbench:](https://arxiv.org/abs/2412.06559)
[Identifying process errors in mathematical reasoning.](https://arxiv.org/abs/2412.06559)
Preprint, arXiv:2412.06559.


11

**A** **Details of Prompt used of Attribute**
**Annotations**

The prompt used in the curation process of ControlR-4K to produce attribute annotations was depicted
in Figure A1.

**B** **Details of Dataset Control-R-4K**

**B.1** **Dataset Collection**

As shown in Table A1, the Control-R-4K dataset
consists of three components: main subset, search
task subset, and extended subset.
The main subset data comprises AIME exam
problems from 1983 to 2023, AMC exam problems
from 2022, and a random sample of problems from
the MATH dataset.

The search task subset is automatically synthesized using random rules and includes problems
on the 24-points Game and calculus calculations.
The calculus problems encompass tasks such as
differentiation, integration, limit evaluation, and
differential equations solving.
The extended subset data is composed of the
datasets [bespokelabs/Bespoke-Stratos-17k](https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k),
[NovaSky-AI/Sky-T1_data_17k](https://huggingface.co/datasets/NovaSky-AI/Sky-T1_data_17k), and
[simplescaling/s1K.](https://huggingface.co/datasets/simplescaling/s1K)

**B.2** **Sampling Responses**

The supplementary data already includes responses
generated via Long Chain-of-Thought and remains
unchanged.
For the primary data and search task data, we
perform response sampling using DeepSeek-R1.
We maintain the hyperparameters originally recommended for sampling, with an exception of adjusting the sampling temperature to 1.0 to achieve
more diverse response data.
The sampling outcomes are evaluated for accuracy using the grading tool from PRM800K (Lightman et al., 2023b), and any incorrect sampling
outcomes are discarded.

**B.3** **Attribute Annotations**

We utilize ChatGPT-4o to annotate the attributes of

the aforementioned response data. The temperature
for the annotation process is set to 0.0. The prompt
used for the annotation process is as shown in Figure A1, and a sampled structured representation is
as follows,

{
"analysis": {
"execution_control_scores": {


"search_depth": 8,
"search_breadth": 7,
"error_detection": 8,
"error_correction": 7,
"strategy_switching": 6
},
"quality_evaluation_scores": {
"correctness": 9,
"efficiency": 7,
"completeness": 8,
"coherence": 8,
"knowledge_accuracy": 9,
"clarity_of_steps": 8
},
"justification": "The reasoning..."
}
}

Then we convert this structure to the control

fields as a string in the following pythonic format:

"\n<control> search_depth: 8; search
_breadth: 7; error_detection: 8; err
or_correction: 7; strategy_switching
: 6; correctness: 9; efficiency: 7;
completeness: 8; coherence: 8; know
ledge_accuracy: 9; clarity_of_steps
: 8 <control/>"

**C** **Hyper-parameter Settings in training**

The training process employs LoRA (Low-Rank
Adaptation) (Hu et al., 2021), Flash-Attention2 (Dao, 2023), and Liger Kernel (Hsu et al.,
2024) for optimization, fine-tuning based on
Qwen2ForCausalLM from the Huggingface Transformers library [1] . The training is distributed across
four nodes with a total of 32 A100 GPUs on a slurm

cluster (eight GPUs per node) and utilizes the DeepSpeed ZeRO-3 (Rajbhandari et al., 2020) optimization strategy to minimize memory consumption
and enhance computational efficiency. The rank of
LoRA layers is set to 16, with all linear layers of
the model as the targets of LoRA adapters.
For optimization, the training procedure adopts
the Adam (Kingma, 2014) optimizer ( _β_ 1 = 0.9, _β_ 2 =
0.999, _ϵ_ = 1e-8) and BF16 (bfloat16) (Kalamkar
et al., 2019) precision. The initial learning rate is
set to 5e-5, following a cosine learning rate scheduler with a warm-up ratio of 10%. The total batch
size is fixed at 32, and gradient accumulation is not
enabled.

During training, a total of 1,660 steps were completed. At the end of training, the final loss was
0.4431, with an overall average loss of 0.5690, a
sample-level loss of 0.9674, and a gradient norm
of 0.24096.

1 https://github.com/huggingface/transformers/


12

You are an advanced data annotation and analysis assistant responsible for fine-grained scoring and structured annotation of textual content. Please
strictly follow the requirements below:

=====================================================================
【 Scoring Dimensions 】

We divide the reasoning/search process into two main categories: "Execution Control" and "Quality Evaluation." Each category has several sub-items,
all of which should be scored on an integer scale from 0 to 9 (0 being the lowest, 9 being the highest).
1) Execution Control, 5 sub-items:
a) Search Depth (search_depth)
- 0: Extremely shallow, stops after one or two steps, lacks depth of thought
- 9: Extremely deep, includes multi-layer reasoning or step-by-step refinement, or demonstrates advanced strategies such as divide-and
conquer
b) Search Breadth (search_breadth)
- 0: Almost no branching, follows a single path
- 9: Explores multiple possibilities at the same level, compares them in parallel, or attempts different paths multiple times; demonstrates
advanced strategies such as classification discussions or dialectics
c) Error Detection (error_detection)
- 0: Almost no error checking, no reflection, or random checks that misidentify correct content as incorrect
- 9: Very frequent and strict self-checking, verification, or error correction, with high detection and accuracy rates
d) Error Correction (error_correction)
- 0: Rarely or never corrects errors even if detected, or has a low success rate in corrections, or even mistakenly alters correct content
- 9: Actively backtracks, revises, and retries multiple times to ensure correctness, with a high accuracy rate after corrections
e) Strategy Switching (strategy_switching)
- 0: Blindly switching strategies, leading to inefficient exploration, abandonment of effective strategies, or rigid adherence to a single approach
without flexibility
- 9: Frequently or highly flexibly switching strategies with purpose and strategic intent, making efficient method changes
(DFS/BFS/algebra/intuitive approaches, etc.), leading to improved efficiency, escaping from incorrect strategies, or conducting multi-method
comparisons
2) Quality Evaluation, 6 sub-items:
a) Final Correctness (correctness)
- 0: Answer is clearly incorrect
- 9: Conclusion aligns perfectly with facts or the standard answer
b) Reasoning Focus/Search Efficiency (efficiency)
- 0: Excessive redundant branches, many ineffective attempts
- 9: Achieves high-quality search with minimal resources/steps
c) Search Completeness (completeness)
- 0: Severely lacking, missing conditions, arguments, or key reasoning steps; fails to consider possible cases
- 9: Fully covers all essential conditions, arguments, and steps required for the task, with comprehensive and thorough analysis
d) Logical Coherence (coherence)
- 0: Contradictory and chaotic, reasoning process is disjointed
- 9: Highly rigorous and self-consistent, with tight and logical connections throughout
e) Accuracy of Knowledge Application (knowledge_accuracy)
- 0: Numerous factual/conceptual errors
- 9: Perfectly correct application of knowledge
f) Clarity of Steps (clarity_of_steps)
- 0: Confusing process expression, difficult to understand, reasoning process skips or omits steps, key steps are missing, or the derivation of
critical arguments/conditions is unclear
- 9: Steps are clearly structured and easy to understand, reasoning process is transparent, key steps are complete, and the derivation of
arguments or conditions is explicitly clear

=====================================================================
【 Output Format Requirements 】

1. Your output must strictly follow the JSON format without any extra text or explanations. The root structure is as follows:
{
"analysis": {
"execution_control_scores": {
"search_depth": <int>,
"search_breadth": <int>,

"error_detection": <int>,

"error_correction": <int>,

"strategy_switching": <int>
},
"quality_evaluation_scores": {
"correctness": <int>,
"efficiency": <int>,
"completeness": <int>,
"coherence": <int>,

"knowledge_accuracy": <int>,
"clarity_of_steps": <int>
},
"justification": "…"
}
}
2. Each score must be an integer between 0 and 9.
3. The justification field should contain 1 to 5 brief sentences explaining the reasoning behind your scores.

=====================================================================
【 Task Instructions 】

- I will provide a piece of text to be annotated.

- Carefully read it and assign scores for the 11 categories listed above, outputting the required JSON structure.
【 When I Provide the Text, Respond Directly in JSON Format Without Any Additional Content 】
-- The above defines the scoring criteria and output requirements. I will now paste the text to be annotated. -This is the text to be annotated:

Figure A1: Prompt used of Attribute Annotations

13

**subset** **capacity** **generated from** **attribute annotation labeler**

main 2610 Deepseek-R1 ChatGPT-4o
search task 1895 Deepseek-R1 ChatGPT-4o
extended 35000 QwQ-32B, Deepseek-R1, Gemini2-Flash-Thinking ChatGPT-4o

Table A1: Subsets of Control-R-4K

**D** **Detailed results of AIME2025 Part I**

The detailed results of AIME 2025 Part I are shown

in Table A2.

14

**Model** **Avg. Acc.** **1** **2** **3** **4** **5** 6 7 8 9 10 11 12 13 14 15

O3-mini (high) 80 100 100 100 100 75 100 100 100 100 75 100 100 50 0 0
**O1 (medium)** 78.33 100 100 100 100 100 100 75 50 100 100 100 100 25 25 0
O3-mini (medium) 73.33 100 100 100 100 75 100 50 100 100 100 75 100 0 0 0
DeepSeek-R1 65 100 100 100 100 100 100 50 100 75 25 25 100 0 0 0
DeepSeek-R1-Distill-Qwen-32B 53.33 100 50 100 100 100 100 25 75 100 0 25 25 0 0 0
O3-mini (low) 53.33 100 100 100 100 100 100 50 100 25 0 0 25 0 0 0
Gemini-2.0-Flash-Thinking 51.67 100 0 100 100 100 100 0 100 50 0 50 50 0 0 0
DeepSeek-R1-Distill-Llama-70B 50 100 50 100 100 75 100 0 50 50 0 25 100 0 0 0
DeepSeek-R1-Distill-Qwen-14B 50 100 50 100 100 100 100 0 75 50 0 0 75 0 0 0
QwQ-32B-Preview 36.67 100 25 100 100 0 100 0 100 0 0 0 25 0 0 0

Gemini-2.0-Flash 30 100 0 100 100 0 100 0 50 0 0 0 0 0 0 0

DeepSeek-V3 28.33 100 0 50 100 0 75 0 75 25 0 0 0 0 0 0
gemini-2.0-pro 26.67 100 0 75 100 0 100 0 25 0 0 0 0 0 0 0
DeepSeek-R1-Distill-Qwen-1.5B 25 100 0 100 25 0 100 0 50 0 0 0 0 0 0 0
gpt-4o 13.33 100 0 25 0 0 0 0 0 75 0 0 0 0 0 0
claude-3.5-sonnet 3.33 25 0 0 0 0 0 0 0 25 0 0 0 0 0 0

Control-R-32B (Ours) 55 100 75 100 100 100 100 0 75 100 0 0 75 0 0 0

Table A2: Detailed experiments on AIME2025 Part I Benchmarks, metric is Pass@1(n=4). Reported results cited
from MathArena Project (SRI_Lab, 2025).

15

