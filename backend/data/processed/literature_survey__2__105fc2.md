## CRAVEMAP: A CONTEXT-AWARE COGNITIVE ARCHITECTURE FOR FOOD INTELLIGENCE

## Technical Research Proposal

Document scope. This condensed document retains only the research gap, technical novelty, technical comparisons, methodology, system pipeline, detailed workflow, practical example and three research objectives. MTGCN is treated as a proposed model; claims of superiority require implementation and controlled evaluation.

## 1. Technical Comparison: FGCN, GAME and Proposed MTGCN

## 1.1 FGCN and GAME: Established Contributions

FGCN (Gao et al., 2022) constructs a heterogeneous food graph around users, recipes, and ingredients. It models ingredient-ingredient, ingredient-recipe, and recipe-user relations through multiple graph informationpropagation layers. Its experiments report improved food recommendation performance over the baselines considered in that paper and investigate data sparsity. FGCN is therefore a relevant baseline for food-entity representation learning, not a weak or obsolete model [9].

GAME (He, Chow, and Zhang, 2020) learns graphical and attentive multi-view embeddings for occasional group recommendation. It aggregates information across group, user, and item views and uses neural collaborative filtering to model interactions. The paper reports improvements over its evaluated baselines, particularly for cold-start groups and items. CraveMap must therefore position its group mechanism as an extension toward operational dining constraints and persistent personal memory, not as the first solution to group cold start [2].

## 1.2 Proposed MTGCN: Multimodal Taste-Context Graph Network

MTGCN is the proposed graph-learning component of CraveMap. It extends the graph representation from recipe and group interactions toward a heterogeneous food-intelligence graph containing:

- User nodes: explicit preferences, dietary requirements, visit history, saved items, feedback, and group membership.
- Restaurant and dish nodes: restaurant identity, location, price range, menu items, and dish descriptions.
- Food-attribute nodes: ingredients, flavour dimensions (such as spicy, sour, sweet, bitter, and umami), texture, and preparation techniques.
- Context nodes/features: time, weather, budget, distance, meal occasion, and temporary mood.
- Interaction/event nodes: saved, visited, liked, rejected, vetoed, and source-provenance events.

Unlike a graph limited to user-recipe-ingredient links or group-user- item views, the proposed graph connects user taste attributes with dish properties and the context in which a preference was expressed. The purpose is to support cross-cuisine generalisation: a user can be matched to an unfamiliar cuisine through shared flavour, ingredient, texture, or preparation characteristics rather than only through a previously selected cuisine label.

Status: MTGCN is a proposed research model. It is not present as a trained model in the current implementation documentation. The current system uses explicit taste vectors, rule-based scoring, and weighted consensus. MTGCN must be implemented and benchmarked before any claim of improved accuracy over FGCN or GAME is made.

## 1.3 Technical Comparison Matrix

Table 1: Technical comparison of FGCN, GAME and proposed MTGCN

| Proposed MTGCN   | Unified food-intelligence represen- tation supporting personal, contex- tual and group decisions.   | Users, restaurants, dishes, ingredi- ents, cuisine labels, taste attributes, context and behavioural events.   | Typed relations such as user-likes- taste, dish-contains-ingredient, dish-has-flavour, user-visits- restaurant, and item-suitable-   | under-context. Proposed relation-aware heteroge- neous graph message passing, mul- timodal node features and context- conditioned attention.                       | Text, link/video metadata and image-derived food attributes are normalised into graph features with source and confidence metadata. A multidimensional taste signature over flavour, ingredients, texture, preparation and dish characteristics,   | in addition to cuisine preference. Time, weather, location, distance, budget and mood are explicit con- ditioning features for retrieval and ranking.   |
|------------------|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| GAME             | Occasional group recom- mendation.                                                                  | Groups, users and recom- mendation items across mul- tiple views.                                              | Interactions across group, user and item views; attention-based counterpart aggregation. Multi-view embeddings,                      | attention aggregation and neural collaborative filtering. The published formulation focuses on multi-view group recommendation; cross- media food ingestion is not | its target. Group/user/item preference representations.                                                                                                                                                                                            | Context is not the central objective of the published GAME formulation.                                                                                 |
| FGCN             | Food/recipe recommenda- tion.                                                                       | Users, recipes and ingredi- ents. Ingredient-ingredient,                                                       | ingredient-recipe and recipe-user relations. Multi-layer graph convolu-                                                              | tion and information propa- gation. The published formulation is primarily a structured food- relation graph; social-media ingestion is not its target.            | User-recipe preference in- formed by ingredients and recipe relations.                                                                                                                                                                             | Context is not the central objective of the published FGCN formulation.                                                                                 |
| Technical aspect | Primary task                                                                                        | Primary entities Graph relations                                                                               | Representation learning                                                                                                              | Multimodal signal handling                                                                                                                                         | Preference repre- sentation                                                                                                                                                                                                                        | Context modelling                                                                                                                                       |

| Proposed MTGCN   | Feasibility-first dining consen- sus with dietary/budget/distance constraints, member-level utility, minimum-satisfaction protection and reason-coded veto updates.   | Connected to Social Hunter, Taste Alchemist, Lifestyle Operator, Dis- covery Agent, Group Consensus Engine and Agency Daemon. Explicit event memory updates preference dimensions; temporal   | decay and context-specific feedback are proposed. Proposed popularity-calibrated candidate generation, taste-aware exploration and Maximal Marginal Relevance (MMR) reranking.   | No comparative performance re- sult yet. Requires implementation, controlled baselines and ablation experiments.     |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| GAME             | Group preference represen- tation and recommendation are central.                                                                                                     | Learns group recommenda- tion representations; proac- tive agent execution is out- side the core model. Depends on interaction and group-view information.                                    | Not the principal focus of the GAME paper.                                                                                                                                       | Published experiments on two real-world datasets; reported gains, especially for cold-start groups and items.        |
| FGCN             | Not the principal task.                                                                                                                                               | Learns representations for recommendation; external action orchestration is out- side the core model. Depends on graph data and retraining/update strategy.                                   | Not the principal focus of the FGCN paper.                                                                                                                                       | Published experiments on a real-world food dataset; reported gains over evalu- ated baselines and sparsity analysis. |
| Technical aspect | Group decision support                                                                                                                                                | Autonomous exe- cution Feedback and tem- poral adaptation                                                                                                                                     | Diversity and pop- ularity control                                                                                                                                               | Evidence reported                                                                                                    |

## 1.4 Interpretation of the Comparison

The comparison is a capability and problem-scope comparison, not a claim that MTGCN is already more accurate. FGCN is specialised in high-order food-entity relations, while GAME is specialised in multi-view occasional-group recommendation. MTGCN proposes to combine and extend these ideas with multimodal evidence, dish-level taste attributes, dynamic context, persistent personal memory, and feedback. The expected advantage is broader functional coverage and better alignment with CraveMap's requirements. Whether this produces better ranking quality, group satisfaction, or long-tail discovery must be established experimentally.

## 2. Existing Technology versus the Proposed CraveMap Stack

The current implementation and the proposed research extension must be kept distinct. The current system documentation describes React/Vite, Express, Telegraf, OpenClaw-based agent workflows, Groq Llama 3, Gemini Vision, Python scoring services, external search/geospatial/weather APIs, Socket.IO, and per-user JSON vaults. The proposed MTGCN extension adds a graph-learning and semantic-retrieval layer; those additions should not be described as completed until implemented.

Table 2: Current implementation compared with the proposed research stack

| Reason for the extension          | Converts noisy input into consis- tent features that can be validated and added to the graph.                                  | Captures relationships beyond cuisine labels and supports cross- cuisine taste generalisation.                                         | Makes the proposed MTGCN a testable model rather than a conceptual label.                                                                     | Enables semantic matching when the user's query and a dish de- scription use different words.                                                    | Separates authoritative structured records from approximate seman- tic retrieval.                                                                |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| Proposed research extension       | Keep the existing ingestion ser- vices; add a typed extraction schema with confidence, prove- nance, dish, ingredient, flavour | and preparation fields. MTGCN heterogeneous graph with user, restaurant, dish, in- gredient, taste-attribute, context and event nodes. | PyTorch Geometric (or an equivalent graph-learning li- brary) to implement relation- aware message passing and context-conditioned attention. | A single selected embedding model, such as BGE or Jina, for textual food descriptions; image-derived descriptions or a multimodal encoder can be | added where justified. PostgreSQL for structured en- tities/events plus Qdrant for vector retrieval; migrate only after schema and backup tests. |
| Current CraveMap imple- mentation | Telegram/Telegraf, text pars- ing, Python ingestion with yt-dlp, Groq Llama 3, Gemini Vision.                                  | Cuisine, area, budget, vibe, visit state and taste vectors derived from vault history.                                                 | No trained FGCN/GAME- style graph model is docu- mented in the current imple- mentation.                                                      | Current extraction and explicit profile/scoring logic.                                                                                           | Per-user local JSON vaults.                                                                                                                      |
| Layer                             | Input and inges- tion                                                                                                          | Food representa- tion                                                                                                                  | Graph learning                                                                                                                                | Semantic repre- sentation                                                                                                                        | Persistent mem- ory                                                                                                                              |

| Reason for the extension          | Improves candidate relevance and diversity while reducing de- pendence on cuisine labels and popularity.                   | Moves from isolated rules toward a consistent context represen- tation shared by discovery and recommendation.   | Reduces majority domination and prevents a distance or budget veto from incorrectly changing cuisine taste.                              | Avoids unnecessary framework replacement while making work- flows reproducible and testable.                                                           | Demonstrates actual improve- ments instead of relying only on successful demonstrations.                                                 |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| Proposed research extension       | Hybrid candidate retrieval, taste-attribute similarity, context-aware scoring, pop- ularity calibration and MMR reranking. | Context-conditioned graph fea- tures and explicit context utility in the final ranker.                           | Constraint-first filtering, member-level utility, average- plus-minimum satisfaction ag- gregation and reason-specific feedback updates. | Retain the working orches- tration; formalise agent in- puts/outputs, state, retry rules and audit logs. LangGraph is optional if it solves a measured | orchestration problem. Offline ranking tests, group- decision evaluation, ablations, latency/cost monitoring and reproducible test sets. |
| Current CraveMap imple- mentation | Taste-vector scoring, rule- based filters, Tavily cold-start search, Nominatim discovery and wildcard selection.           | OpenWeather, time-of-day rules, location and budget filtering through agents.                                    | Python Social Brain with weighted voting, exper- tise/mood factors and veto- driven reweighting.                                         | OpenClaw/skill-based work- flows coordinated through Express and the Telegram bot.                                                                     | Dashboard operation feed and demo/fallback behaviour.                                                                                    |
| Layer                             | Recommendation and retrieval                                                                                               | Context process- ing                                                                                             | Group decision                                                                                                                           | Agent orchestra- tion                                                                                                                                  | Evaluation and monitoring                                                                                                                |

Technology selection note: The JSON vault is the current implementation. PostgreSQL and Qdrant are proposed target components, not current facts. The project should select one structured database rather than introducing PostgreSQL and MongoDB simultaneously without an explicit need. Redis is optional for caching or shared state; it is not required to validate the MTGCN research contribution.

## 3. Research Gap

The reviewed papers show that food graph learning, multi-view group recommendation, context-aware filtering, multi-criteria ranking, conversational recommendation and agent-based systems are established research areas. The gap identified for CraveMap is not the absence of these individual techniques. It is the lack, within the set of reviewed systems, of a unified architecture that combines the following capabilities in one persistent operational workflow:

1. acquisition of personal food signals from text, links, video metadata and images;
2. persistent memory for saved restaurants, dishes, visits, explicit preferences and reason-coded feedback;
3. preference representation at the level of flavour, ingredients, texture and preparation, not only cuisine labels;
4. joint reasoning over long-term taste, live context and practical constraints;
5. group decisions that preserve hard constraints and consider the least-satisfied member, not only average group preference;
6. proactive agent execution and feedback-driven updates; and
7. bias-aware discovery that can surface less-exposed cuisines when their food attributes match the user's taste.

FGCN provides a strong food-relation learning baseline, and GAME provides a strong occasional-group recommendation baseline. Neither should be portrayed as generally inferior. Their primary formulations are narrower than the full CraveMap target. The research question is whether extending graph representation with multimodal taste and context relations, and connecting it to persistent memory and agent workflows, improves the tasks that CraveMap is designed to solve.

## 4. Proposed Technical Novelty

The proposed novelty is a system-level architecture supported by a new domain-specific graph formulation, rather than the use of an LLM or an agent framework alone.

1. Multimodal Personal Food Memory: A signal-to-memory pipeline converts messages, social links, video metadata and food images into structured, source-attributed food records.
2. MTGCN: Multimodal Taste-Context Graph Network: A proposed heterogeneous graph model connects users, restaurants, dishes, ingredients, flavour dimensions, preparation techniques, context and behavioural events.
3. Cross-Cuisine Taste Generalisation: User preferences are represented through food attributes such as spice, acidity, umami, fermentation, texture and cooking method. Candidate dishes can therefore match the user's taste even when their cuisine label is unfamiliar.
4. Context-Conditioned Recommendation: The system combines persistent food memory with location, time, weather, budget, visit history and current intent.

5. Bias-Aware Exploration: Candidate coverage, popularity calibration, taste-compatible exploration and MMR reranking are proposed to avoid repeatedly returning only highly visible or familiar restaurants.
6. Fairness-Aware Group Consensus: Group decisions apply mandatory constraints first and then balance average group utility with the minimum member utility. Veto reasons update the relevant preference dimension rather than indiscriminately penalising a cuisine.
7. Closed-Loop Agentic Adaptation: Specialist agents perform ingestion, recommendation, discovery, contextual monitoring, group consensus and proactive execution. Their outputs are recorded as events that can update personal memory.

The term "novel" refers to the proposed integration and domain-specific MTGCN formulation. The individual building blocks (graph neural networks, embeddings, RAG, LLMs, attention, MMR and multi-agent orchestration) are established techniques. The proposed contribution must be validated through implementation, ablation and comparison.

## 5. Proposed Methodology

The methodology is organised into eight stages. The first stages use capabilities already documented in the current prototype; the MTGCN training, hybrid retrieval and bias-aware ranking stages are proposed research extensions.

## 5.1 Stage 1: Multimodal Signal Acquisition

The system receives food-related information through Telegram text, restaurant links, social-media URLs, short-form video metadata and uploaded images. Telegraf handles bot interaction; Python ingestion services process supported media metadata; Groq Llama 3 extracts structured fields from text; and Gemini Vision assists with image interpretation and visit verification.

## 5.2 Stage 2: Entity Extraction, Enrichment and Validation

The extraction service produces a structured record containing restaurant name, dish, cuisine, ingredients (when available), flavour attributes, preparation method, location, price range, atmosphere, source and extraction confidence. Tavily can enrich missing public information, while Nominatim/Overpass can support geospatial lookup. The system should distinguish verified data from model-inferred data, resolve duplicates, and reject unsupported claims rather than silently inventing missing values.

## 5.3 Stage 3: Persistent Personal Food Memory

The current prototype stores per-user profiles, restaurants, craving patterns and analytics in JSON vaults. The proposed target separates structured entities and events from semantic retrieval: PostgreSQL can store authoritative user, restaurant, dish, visit and feedback records, while Qdrant can index text embeddings for semantic retrieval. A graph builder creates or updates MTGCN nodes and typed edges from these records. Database migration is an implementation task, not a prerequisite for explaining the current prototype.

## 5.4 Stage 4: Taste Signature and Context Representation

The Taste Alchemist derives a user representation from explicit preferences and behavioural events. In the proposed extension, the representation is expanded from cuisine-frequency and vibe signals to food attributes such as spice, acidity, umami, fermentation, texture, ingredients and preparation. The Lifestyle Operator supplies current weather and time context; the discovery and recommendation services add location, distance and budget.

## 5.5 Stage 5: MTGCN Representation Learning

Let G = (𝑉, 𝐸) be a heterogeneous graph. Each node 𝑣 has a node type 𝜏(𝑣) and an initial feature vector h (0) 𝑣 obtained from structured attributes and available text/image-derived features. Let R be the set of relation types and N𝑟 (𝑣) the neighbours of node 𝑣 connected by relation 𝑟. A proposed relation-aware message-passing layer is:

$$h _ { v } ^ { ( l + 1 ) } = \sigma \left ( W _ { \tau ( v ) } \mathbf h _ { v } ^ { ( l ) } + \sum _ { r \in \mathcal { R } _ { l } } \sum _ { u \in \mathcal { N } _ { r } ( v ) } \alpha _ { u v } ^ { ( r ) } W _ { r } \mathbf h _ { u } ^ { ( l ) } + W _ { c } \mathbf e _ { v } \right ) ,$$

�

�

where 𝑊𝜏 (𝑣) is a node-type transformation, 𝑊𝑟 is a relation-specific transformation, 𝛼 (𝑟 ) 𝑢𝑣 is a learned relation attention weight, and c𝑣 represents available context. This equation defines the proposed design at a conceptual level; the attention function, graph schema, negative sampling, regularisation and training protocol must be specified in the implementation.

A pairwise ranking objective can train preference scores from positive and negative user-dish interactions:

$$\mathcal { L } _ { r a n k } = - \sum _ { ( u , d ^ { + } , d ^ { - } ) } \log \sigma ( s ( u , d ^ { + } ) - s ( u , d ^ { - } ) ) + \lambda \| \Theta \| _ { 2 } ^ { 2 } .$$

If aligned text and image pairs are available, an additional contrastive alignment loss may be evaluated. It should only be included if the project has a sufficiently reliable paired dataset.

## 5.6 Stage 6: Candidate Retrieval and Bias-Aware Ranking

Candidate generation combines saved personal memory with new restaurant candidates retrieved from supported search and geospatial sources. Hard requirements are applied first. The ranker then combines taste similarity, contextual fit, novelty and calibrated exposure. MMR is used to select a diverse shortlist. The process should reserve room for less-exposed cuisines only when their dish-level attributes match the user's taste and the available evidence is adequate.

## 5.7 Stage 7: Constraint-Aware Group Consensus

For group 𝑈 and restaurant candidate 𝑟, each member has a utility 𝑢𝑖 (𝑟) computed from taste match and context. Candidates violating a hard dietary, explicit exclusion, budget or distance constraint are removed before aggregation. A fairness-aware group score is:

$$G ( r ) = \rho \left ( \frac { 1 } { | U | } \sum _ { i \in U } u _ { i } ( r ) \right ) + ( 1 - \rho ) \min _ { i \in U } u _ { i } ( r ) ,$$

where 0 ≤ 𝜌 ≤ 1. The minimum-utility term discourages a majority-optimal recommendation that is unacceptable to one member. The current Social Brain already performs weighted voting and veto reweighting; this minimum-satisfaction objective is a proposed extension.

## 5.8 Stage 8: Action, Feedback and Memory Update

The selected result is delivered through Telegram and the dashboard. Acceptances, rejections, visits and veto reasons are recorded as separate event types. Updates must be dimension-specific and time-aware: a distance rejection should update distance preference, not cuisine preference. The Agency Daemon can use meaningful events and scheduled checks to initiate future workflows, with cooldown rules to limit repetitive notifications.

## 6. End-to-End System Pipeline

Figure-like pipeline below summarises the data and decision flow. It shows both the existing components and the proposed MTGCN/ranking extensions.

<!-- image -->

## 6.1 Agent Interaction Summary

The Social Hunter feeds validated records into personal memory. The Taste Alchemist combines memory and taste representation to rank personal recommendations. The Lifestyle Operator contributes current context. The Discovery Agent broadens the candidate pool and applies taste-aware diversity. The Group Consensus Engine combines individual utilities while enforcing hard constraints. The Agency Daemon initiates scheduled or event-triggered workflows. The feedback loop updates memory and preference dimensions so that later decisions use the new evidence.

## 7. Detailed System Workflow

CraveMap follows a closed-loop workflow in which multimodal food information is acquired, converted into structured knowledge, stored in persistent personal memory, processed through the proposed MTGCN model, and used by specialised agents to generate individual and group recommendations.

## 7.1 Stage 1: Multimodal User Input

The workflow begins when a user shares food-related information through Telegram or the CraveMap interface. Inputs may include restaurant links, text messages, food images and supported short-form video metadata. The Social Hunter receives these inputs and initiates the appropriate extraction process.

## 7.2 Stage 2: Food Entity Extraction and Enrichment

Groq/Llama 3 is used for natural-language extraction, while Gemini Vision assists with image interpretation. Python-based services process supported media metadata. The system extracts restaurant and dish names, cuisine, location, ingredients, flavour characteristics, texture, preparation techniques, price range, source information and extraction confidence.

Tavily, Nominatim and Overpass can enrich restaurant and geographical information. Extracted records are validated before being added to personal memory. The system distinguishes verified information from modelinferred attributes.

## 7.3 Stage 3: Persistent Personal Food Memory

Validated information is stored in the user's personal food memory. The current implementation uses peruser JSON vaults. The proposed scalable architecture uses PostgreSQL for structured records and Qdrant for semantic vector retrieval. The memory maintains saved restaurants, dishes, ingredients, preferences, visits, feedback and behavioural events.

## 7.4 Stage 4: Heterogeneous Food Graph Construction

The proposed MTGCN requires a heterogeneous graph constructed from information stored in personal memory. The graph contains user, restaurant, dish, ingredient, flavour, preparation and behavioural event nodes, together with contextual features. Typed relationships connect these entities, such as user-likes-dish, dish-containsingredient, dish-has-flavour-attribute and user-visited-restaurant.

## 7.5 Stage 5: MTGCN Representation Learning

The proposed MTGCN processes the heterogeneous graph using relation-aware message passing and attention. Information is aggregated from connected neighbouring nodes. Relationship-specific transformations distinguish different types of connections, while attention weights determine the relative importance of neighbouring information. Contextual features are incorporated into the learned representations. The resulting user and dish embeddings are intended to capture food preferences at a more detailed level than cuisine labels or interaction frequency alone.

## 7.6 Stage 6: Context-Aware Candidate Generation

The Taste Alchemist retrieves relevant personal memories and uses the learned taste representation to evaluate candidate dishes and restaurants. The Lifestyle Operator contributes time, meal occasion, weather, location, travel distance, budget and visit-history signals. The Discovery Agent retrieves additional candidates and evaluates their compatibility with the user's taste characteristics.

## 7.7 Stage 7: Bias-Aware Ranking and Group Consensus

Candidate restaurants are checked against mandatory requirements such as dietary restrictions, explicit exclusions, budget and distance. The remaining candidates are ranked using taste compatibility, contextual suitability, novelty and diversity. For group requests, the Group Consensus Engine evaluates individual member preferences and applies group-level aggregation while preserving mandatory constraints.

## 7.8 Stage 8: Recommendation and Feedback

The final recommendation is delivered through Telegram or the application interface. The user may accept, reject, visit or veto a recommendation. These interactions are recorded as separate behavioural events. Reasonspecific feedback updates the corresponding preference dimension. For example, rejecting a restaurant because it is too expensive should update budget suitability rather than reduce the user's preference for its cuisine. The Agency Daemon can subsequently initiate recommendations using contextual or scheduled triggers.

## 8. Practical Example: Demonstrating the Proposed CraveMap Architecture

This section demonstrates how CraveMap processes a user's food preferences and generates recommendations through its proposed MTGCN-based architecture. The example illustrates multimodal food ingestion, graph construction, taste representation, cross-cuisine generalisation, contextual ranking and group decision-making. All numerical values and recommendation outcomes are illustrative and do not represent measured MTGCN outputs.

## 8.1 Step 1: Initial User Interactions

Consider a user who regularly saves and visits restaurants serving Korean and Thai food. The user shares Korean Kimchi Stew, Thai Tom Yum Soup and Sichuan Hot-and-Sour dishes, and provides positive feedback on dishes containing strong spices, sour ingredients and fermented flavours. Rather than restricting the user profile to cuisine labels, CraveMap attempts to identify the food characteristics underlying these interactions.

## 8.2 Step 2: Multimodal Extraction

The Social Hunter processes the saved food information and extracts structured attributes, as illustrated in Table 3.

Table 3: Illustrative Food Attribute Extraction

| Dish              | Cuisine         | Ingredients                        | Food Characteristics          |
|-------------------|-----------------|------------------------------------|-------------------------------|
| Kimchi Stew       | Korean          | Kimchi, tofu, chilli, garlic       | Sour, spicy, umami, fermented |
| Tom Yum           | Thai            | Lemongrass, chilli, lime, galangal | Sour, spicy, aromatic         |
| Hot-and-Sour Dish | Sichuan Chinese | Chilli, vinegar, spices            | Spicy, sour, aromatic         |

The attributes are extracted from available descriptions, images and food information. Source information and confidence are preserved rather than treating every inferred attribute as verified.

## 8.3 Step 3: Personal Food Graph Construction

The extracted information is converted into graph entities and relationships. Examples include:

- User A - likes - Kimchi Stew.
- Kimchi Stew - contains - Kimchi.
- Kimchi Stew - has-flavour - Sour.
- Kimchi Stew - has-flavour - Umami.
- Kimchi - has-property - Fermented.
- User A - prefers - High Spiciness.
- User A - visited - Restaurant X.

The graph captures relationships between the user, food items, ingredients and taste attributes. This enables the system to identify common characteristics across different food categories.

## 8.4 Step 4: Generating the User Taste Signature

Based on explicit preferences and recorded interactions, the proposed system constructs a multidimensional taste signature:

$$t _ { u } = [ 0 . 8 5 , \, 0 . 9 0 , \, 0 . 8 5 , \, 0 . 8 0 , \, 0 . 7 0 , \, 0 . 6 5 , \, 0 . 7 5 ]$$

The dimensions represent spiciness, acidity, umami, fermentation, aromatic intensity, texture preference and preparation-method preference, respectively. These are illustrative normalised scores. Actual values must be estimated from user interactions and calibrated using training and validation data.

## 8.5 Step 5: MTGCN Learns Food Relationships

The proposed MTGCN performs relation-aware message passing over the constructed graph. The User A node receives information from previously liked dishes, their ingredients, flavour attributes and preparation methods. Attention mechanisms assign learned importance to different relationships. Consequently, the model attempts to learn that the user's preferences are associated with characteristics such as spiciness, acidity and umami, rather than only with Korean or Thai cuisine. The resulting representation is used to evaluate candidate dishes.

## 8.6 Step 6: Cross-Cuisine Recommendation

Suppose the Discovery Agent identifies a restaurant serving Ethiopian Doro Wat, a dish from a cuisine the user has not previously explored. The candidate is evaluated using its available food characteristics, ingredients and preparation information.

Table 4: Illustrative Cross-Cuisine Compatibility Analysis

| Food Characteristic   | User Preference   | Candidate Evidence                 |
|-----------------------|-------------------|------------------------------------|
| Spiciness             | High              | Spiced preparation                 |
| Aromatic intensity    | Moderately high   | Aromatic spice mixture             |
| Umami                 | High              | Requires dish-level evidence       |
| Acidity               | High              | Requires dish-level evidence       |
| Fermentation          | Moderately high   | Requires ingredient-level evidence |

The system identifies a potential match based on attributes supported by available evidence. It must not assume that Doro Wat has every characteristic the user enjoys. If the dish satisfies the user's taste requirements and mandatory constraints, it can be included in the recommendation shortlist. This demonstrates cross-cuisine generalisation: a dish can be considered because its food characteristics match the user's preferences, even when its cuisine is unfamiliar.

## 8.7 Step 7: Context-Aware Ranking

Assume the current context is an evening with rainy weather, a budget within the user's specified limit, a candidate within the permitted travel distance, and a restaurant that has not previously been visited. The Taste Alchemist combines taste compatibility with contextual suitability. The Lifestyle Operator contributes weather and time information, while the Discovery Agent supplies candidate restaurants. Hard dietary, budget and distance constraints are applied before final ranking. Popularity and diversity controls are then used to reduce repetitive recommendations.

## 8.8 Step 8: Group Dining Consensus

Consider a group of four users who want to have dinner. Each member has different preferences and requirements, as shown in Table 5.

Table 5: Illustrative Group Preference Profiles

| Member   | Preference                    | Constraint                      |
|----------|-------------------------------|---------------------------------|
| Member A | Spicy and sour food           | Budget within Rs. 500           |
| Member B | Mild and aromatic food        | Vegetarian requirement          |
| Member C | High umami and rich flavours  | Maximum travel distance of 3 km |
| Member D | Varied cuisine and new dishes | Budget within Rs. 400           |

The Group Consensus Engine evaluates candidate restaurants against individual taste profiles. Restaurants violating mandatory dietary requirements, budget limits or distance restrictions are removed before group scoring. For the remaining candidates, the proposed group utility is:

$$G ( r ) = \rho \left ( \frac { 1 } { | U | } \sum _ { i \in U } u _ { i } ( r ) \right ) + ( 1 - \rho ) \min _ { i \in U } u _ { i } ( r )$$

This considers both average group satisfaction and the satisfaction of the least-satisfied member. The selected restaurant is therefore not necessarily the one preferred by the majority. It is the feasible option that provides a better balance across the group.

## 8.9 Step 9: Feedback and Continuous Adaptation

After receiving the recommendation, users can accept, reject or veto the selected restaurant. The system records the reason behind each interaction:

- Rejection due to distance updates distance suitability.
- Rejection due to price updates budget suitability.
- Rejection due to flavour updates the relevant taste attribute.
- A successful visit contributes positive behavioural evidence.

The updated events are stored in personal memory and can be used during subsequent graph updates and recommendation cycles.

## 8.10 Overall Demonstration Outcome

This example illustrates how CraveMap transforms scattered food information into structured personal memory, learns relationships between users and food characteristics, discovers potentially compatible dishes across cuisines, incorporates real-time context and coordinates group dining decisions. The proposed MTGCN provides the graph-learning component, while specialised agents manage ingestion, retrieval, contextual reasoning, discovery, consensus and feedback. The complete architecture therefore aims to move beyond one-time food recommendation towards a persistent, adaptive and context-aware food-intelligence system.

## 9. Research Objectives

The objectives are consolidated into three outcome-oriented objectives.

## 9.1 Objective 1: Develop a Multimodal Personal Food Memory System

To develop a personal food-memory system that captures food-related information from text, social-media links, video metadata and images; extracts and validates restaurant, dish and food-attribute information; and maintains persistent user-specific records of saved items, visits and feedback. The proposed MTGCN knowledge representation will connect users, restaurants, dishes, ingredients and taste attributes to support semantic and relational retrieval.

## 9.2 Objective 2: Develop Context-Aware Personalised Recommendation

To develop a recommendation mechanism that combines persistent food memory and multidimensional taste signatures with real-time context including location, time, weather, budget and visit history. The proposed MTGCN and bias-aware ranking extension will support cross-cuisine matching through flavour, ingredient, texture and preparation characteristics, while balancing relevance, novelty and diversity.

## 9.3 Objective 3: Develop Intelligent Group Dining Consensus

To develop a group decision mechanism that combines individual taste profiles and contextual preferences while enforcing dietary, budget and distance constraints. The system will incorporate member-level utility, fairnessaware aggregation and reason-specific veto feedback to produce group recommendations that are practical and acceptable across participants.

## References

- [1] A. Da'u and N. Salim, "Recommendation system based on deep learning methods: a systematic review and new directions," Artificial Intelligence Review, vol. 53, no. 4, pp. 2709-2748, 2020. doi: 10.1007/S10462-019-09744-1.
- [2] Z. He, C.-Y. Chow, and J.-D. Zhang, "GAME: Learning Graphical and Attentive Multi-view Embeddings for Occasional Group Recommendation," in Proceedings of the 43rd International ACM SIGIR Conference on Research and Development in Information Retrieval, pp. 649-658, 2020. doi: 10.1145/3397271.3401064.
- [3] D. Monti, G. Rizzo, and M. Morisio, "A systematic literature review of multicriteria recommender systems," Artificial Intelligence Review, vol. 54, pp. 427-468, 2021. doi: 10.1007/s10462-020-09851-4.
- [4] E. Yalcin, F. Ismailoglu, and A. Bilge, "An entropy empowered hybridized aggregation technique for group recommender systems," Expert Systems with Applications, vol. 166, article 114111, 2021. doi: 10.1016/j.eswa.2020.114111.
- [5] Y. P´erez-Almaguer, R. Yera, A. A. Alzahrani, and L. Mart´ınez, "Content-based group recommender systems: A general taxonomy and further improvements," Expert Systems with Applications, vol. 184, article 115444, 2021. doi: 10.1016/j.eswa.2021.115444.
- [6] S. Song et al., "Food Recommendation Using Sentiment and Collaborative Filtering," 2021.
- [7] R. Rodr´ıguez-Hern´andez and E. Ilarri, "Artificial Intelligence-Based Context-Aware Recommender Systems for Mobile Environments," 2021.

- [8] A. B. Suhaim and J. Berri, "Context-Aware Recommender Systems for Social Networks: Review, Challenges and Opportunities," IEEE Access, vol. 9, pp. 57440-57463, 2021. doi: 10.1109/ACCESS.2021.3072165.
- [9] X. Gao, F. Feng, H. Huang, X.-L. Mao, T. Lan, and Z. Chi, "Food recommendation with graph convolutional network," Information Sciences, vol. 584, pp. 170-183, 2022. doi: 10.1016/j.ins.2021.10.040.
- [10] S. Ahmadian et al., "Healthy Food Recommendation Using a Time-Aware Community Detection Approach and Reliability Measurement," International Journal of Computational Intelligence Systems, vol. 15, article 105, 2022.
- [11] S. Shandilya et al., "MATURE-Food: Food Recommender System for MAndatory FeaTURE Choices: A System for Enabling Digital Health," International Journal of Information Management Data Insights, vol. 2, no. 2, article 100090, 2022. doi: 10.1016/j.jjimei.2022.100090.
- [12] M. Casillo et al., "Context-aware recommender systems and cultural heritage: a survey," Journal of Ambient Intelligence and Humanized Computing, vol. 14, pp. 3109-3127, 2023. doi: 10.1007/s12652-021-03438-9.
- [13] Y. Leng et al., "Dynamically aggregating individuals' social influence and interest evolution for group recommendations," Information Sciences, vol. 614, pp. 223-239, 2022. doi: 10.1016/j.ins.2022.09.058.
- [14] P. Wang, L. Li, Q. Xie, R. Wang, and G. Xu, "Social dual-effect driven group modeling for neural group recommendation," Neurocomputing, vol. 481, pp. 258-269, 2022. doi: 10.1016/j.neucom.2022.01.093.
- [15] J. Yu et al., "Collaborative group embedding and decision aggregation based on attentive influence of individual members: a group recommendation perspective," Decision Support Systems, vol. 165, article 113894, 2023. doi: 10.1016/j.dss.2022.113894.
- [16] Y. Gao, T. Sheng, Y. Xiang, Y. Xiong, H. Wang, and J. Zhang, "Chat-Rec: Towards Interactive and Explainable LLMs-Augmented Recommender System," arXiv:2303.14524, 2023.
- [17] K. Bao et al., "TALLRec: An Effective and Efficient Tuning Framework to Align Large Language Model with Recommendation," 2023.
- [18] Y. Wang et al., "RecMind: Large Language Model Powered Agent for Recommendation," in Findings of the Association for Computational Linguistics: NAACL 2024, pp. 4351-4364, 2024. doi: 10.18653/v1/2024.findings-naacl.271.
- [19] T. Hong and N. F. Ibrahim, "Group recommendation fueled by noise-based graph contrastive learning," Journal of King Saud University Computer and Information Sciences, vol. 36, article 102063, 2024. doi: 10.1016/j.jksuci.2024.102063.
- [20] L. Wu et al., "A survey on large language models for recommendation," World Wide Web, vol. 27, article 60, 2024. doi: 10.1007/s11280-024-01291-2.
- [21] K. Pramod, "Privacy-Preserving Recommender Systems: A Systematic Review," 2022.