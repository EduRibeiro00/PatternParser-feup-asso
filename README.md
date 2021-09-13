# ASSO Class Assignments and Projects

**2020/2021** - 4th Year, 2nd Semester

**Course:** Arquitectura de Sistemas de Software ([ASSO](https://sigarra.up.pt/feup/pt/ucurr_geral.ficha_uc_view?pv_ocorrencia_id=459497)) | Software Systems Architecture

**Project developed by:** Eduardo Ribeiro ([EduRibeiro00](https://github.com/EduRibeiro00)), Miguel Pinto ([MiguelDelPinto](https://github.com/MiguelDelPinto)), Diogo Ferreira de Sousa ([Calmskyy](https://github.com/Calmskyy)), João Paulo Monteiro Leite ([Jopamoleite](https://github.com/Jopamoleite)) and Leonardo Fernandes Moura ([leonardofmoura](https://github.com/leonardofmoura))

**Final Grade:** 19.5 / 20

**Disclaimer** - This repository was used for educational purposes and I do not take any responsibility for anything related to its content. You are free to use any code or algorithm you find, but do so at your own risk.

---

# Paper Parser/Reader for Design Pattern Repository

## Overview

The Reader component is responsible for, given a list of papers (output from the Crawler component), processing and extracting all relevant information that can be found on each paper, such as the paper's title, authors, abstract, list of described patterns, and footer information.

The module was carefully designed and developed, taking into account several restrictions and requirements, that will be discussed further ahead.

The module currently extracts information regarding the following sections and concepts:

* The paper title;
* Information about the authors of the paper, like their name, country, email, etc;
* Information regarding the abstract section of the paper, like the abstract text and mentioned keywords;
* All the patterns described in the paper, describing their context, the solution, the implementation, the consequences, and more;
* General information about the paper, like the name and date of the conference it was presented in, among other fields.

## Requirements

There are some key requirements and system constraints that have a significant bearing on the architecture. They are:

- Efficiently and effectively detecting patterns and other relevant information and data present in the paper.
- Ensuring reliability and making sure that every URL received is processed, making use of the internal module's database for crash recovery
- Ensuring interoperability by making sure that the outputs of the crawler are aligned with this module’s inputs and that this module’s outputs are aligned with the pattern database and whatever components depend on it

### Functional
- **Extract author details from a paper**
    - The application should be able to parse and extract information about the authors of each paper, like their name, country, organization and email. This information should be correctly outputed to the message queue so that other services can use it.
- **Extract all patterns that are described in a given paper** 
    - Given a URL of a paper containing information regarding one or more patterns, the Reader module should be able to extract information about those patterns, and output it in an organized, readable fashion for the next service.
- **Extract paper metadata and information from a paper:** 
    - Given a URL of a paper containing information regarding one or more design patterns, the Reader module should be able to extract general metadata about the paper (title, abstract, date, etc), and output it in a readable fashion for the next service.

### Non-functional

- **Interoperability:** 
    - This service must ensure compatibility with the services it depends on and which depend on it
- **Maintainability:** 
    - This service must be developed in a maintainable way.
- **Reliability:** 
    - This service must be able to ensure that if it starts parsing a certain paper, it will eventually output its details.
    - This is fundamental since this service is the major data source of the entire project. Consuming messages that do not result in any output will result in data loss for the entire system.
- **~~Availability~~:**
    - Not a high priority since even if the service is down, it will parse the messages relative to the paper URLs eventually (when it is back up). Full uptime is not necessary to ensure this, as the service does not need to be online when a message is sent, as long as the output is eventually provided back to the queue.
- **~~Scalability~~:**
    - Not a high priority since this service does not need to reply as soon as a message is received in the queue. It only needs to ensure it will reply eventually to messages that it consumes.
    - Low scalability might result in it being a bottleneck. However, the data will be consumed much more than it will be created, reducing the extent of this problem.

## Design

### Layered Architecure
The structure of the Reader component can be well defined and separated into 3 different tasks: 
* file fetching and conversion
* file parsing and data extraction
* parsed data compilation and output

It's even possible to define to define it as a 5-phase-process if the input and output from the message queues are taken into account. However, the cerne of this service is based on those 3 main tasks.

These phases can be seen as different layers, each one receiving as input the output of the previous layer, and outputing the input of the next layer, forming a data chain.

We can model the system taking into account this layered architecture, to ensure components are connected correctly.

### Handling different paper structures or ways of doing something

#### Problem

If the system receives different files coming from different websites and conferences, chances are that the format and structure of the files is also going to be different. Because of that, there can be many ways of parsing a certain file: files from a certain website may display all the authors in a straight line, other files can have them displayed in different lines, etc. We need to have a way to declare different parsing **strategies**, that depend on the type of the file and its source.

#### Solution

We can use the **Strategy pattern**, and we can have a strategy for parsing authors in the same line, that will be used for those types of papers, another strategy for parsing authors in different lines, that would be applied to other types of papers, etc.

#### Consequences

By using this pattern, not only is the code for different types of paper completely separated and modularized, but if we ever need to support a new type of paper, that has a different structure than others, we can add new strategies for it, without ever needing to change already existing code, thus satisfying the Open-Closed principle from SOLID.

### Allowing multiple parser implementations

#### Problem

Different parser implementations (HTML, plain text, etc) may each have different strategies, based on different approaches and methods, however these parsers still need to be configurable.

#### Solution

For each parser implementation, we can have a **Builder** that has methods for injecting the wanted strategies in the parser object, so it is built exactly how we configure it.

#### Consequences

Once again, the Open-Closed principle is supported, allowing us to extend the funcitonality of the component without needing to alter existing code: if we want to add a new way of parsing the paper, we can do that without changing already existing builders and strategies. Furthermore, this approach allows to decrease the number of parser subclasses that would be needed in order to support all parsing and strategy combinations.

### Middleware for MQTT communication & DB Access

#### Problem

In order to prevent various software modules from accessing the MQTT queue, it is good practice to build a module or class that acts as a middleware between other software and the messages that arrive in the queue. This middleware only needs one instance, as every module that depends on it will call that instance, having only one connection to the MQTT queue.

#### Solution

Because of that, the **Singleton pattern** might be of use. On an important note, the **Singleton** pattern can be considered an anti-pattern, and its usage should be be carefully analysed before actually implementing it. In this case, the usage of Singleton makes sense as we are dealing with middlewares and we need to enforce that only one instance of the connection is open at a time.
This pattern is also useful for the *RecoveryManager* component, in order to maintain a connection with the PostgreSQL database. The reasons for this are the same as stated above.

#### Consequences

As stated, this imposes the restriction that each middleware can only be instantiated once, like it should be. Furthermore, it also allows this middleware to be accessed anywhere in the code, which sometimes can contribute to bad code structure, however the team was careful when using these classes in order to maintain modularity.

### Avoid middleware polling and strict coupling between classes

#### Problem

Some software modules depend on messages arriving from the queue, that will trigger their operations (e.g. when a new file URL arrives from the queue, the file downloader module should download it). We needed a way to avoid having to constantly poll the middleware component to check if a new message had arrived. Furthermore, we also did not want the middleware to be strictly coupled to a specific module, that would be alerted when a new paper arrived.

#### Solution

We opted to implement a **Pub-Sub approach**, where the middleware has **Observers**, that depend on the received messages through the queue. The observer modules subcribe to the middleware and, when a message is received through a specific topic, the middleware can notify the observers of that topic, thus triggering their operations.

#### Consequences

The polling of the middleware was successfully avoided by using this pattern. Now the class that parses and processes each paper is only responsible for that, and not for checking if a new paper has arrived. All it has to do on that regard is to subscribe to the middleware in the beginning.
Another advantage of using the Observer pattern is that the MQTT middleware is not strictly coupled to the paper parsed; it only notifies abstract subscribers, that it has no knowledge of. If, in the future, a functionality was added that required another class or module to be triggered by input message events, it would only need to subscribe to the middleware as well.

### Maintaining "memory" when parsing data

#### Problem

For some complex operations, like parsing a certain design pattern from a paper, it would be useful to maintain some sort of memory regarding the previous operations done, i.e. keeping a state of the current parsing phase (parsing the title, or the description, motivation, etc).

#### Solution

For that, a **State** pattern can be used to keep track of the current phase (represented as a State) and define what operations should be executed when a certain input is received. 

#### Consequences

This allows a clean and easy extendible implementation of the pattern parser, allowing us to add more actions and states (and further extending the granularity and detail of each parsed pattern) if needed. All of this while keeping information about what was parsed previewsly.

### Data Recovery after Crashes

#### Problem

One possible scenario that might happen is the crashing of the service, for various reasons. That can be a problem, specially if we want to ensure that our service is reliable. If we don't mitigate the issue of crashing and service failure, we cannot guarantee that if the service starts parsing a certain paper, it will eventually output its details. If the crash occurs in the middle of the paper processing, the operation is lost.

#### Solution

In order to mitigate this issue, a **crash recovery DB** was added, which serves as a way of storing the URLs that are currently being processed.

#### Consequences

This way, if a failure occurs and the server crashes or shuts down, it still has persistent information about the URLs that it was previously extracting. With that, the operations that were interrupted can be resumed, ensuring the reliability of the service. One negative consequence is that extra storage space is used, however, the group considers that the pros outweigh the cons.

### Logical architecture

The Reader component will consume raw papers from a queue. It will feed the produced output data to a queue, to be consumed by the Pattern Database module. It should persist data in a database to allow crash recovery (if it consumes a message from the queue relative to a paper’s URL for parsing, then it should always output the paper’s information to the queue, regardless of crashing).

![Logical Architecture Diagram](https://i.imgur.com/6XcdJCq.png)

## Implementation

### Main Modules

The main concepts and modules that are part of the architecture of the Reader system are the following:

#### Communication Manager
This module serves as a middle layer between the application code and the MQTT interface. This manager is used to perform all operations that are related to the message queue, like listening for input messages and write output messages.

#### File Downloader
This component downloads the papers, using the URLs extracted from the Paper URLs topic from the MQTT message queue (this is done through the Communication Manager).

#### Parser Director
When the Communication Manager receives a new paper URL, it notifies the Parser Director. This module has the task of creating the correct parser, with the addequate configurations for the type of paper that was downloaded. In order to do that, this module uses a configuration file that matches each supported type of paper with the correct parser and extractors.

#### Paper Converter & Parser
This component receives the downloaded file and converts it to some format (depending on the type of the specific parser that is being used). This parser is also composed of several submodules, each being responsible for a specific part of the paper (title, abstract, patterns, authors, etc). Each of these submodules receives the converted paper and parses the relevant information. In this project, the team implemented a Plain text Converter & Parser, however a parser for another format can easily be developed and used.

#### Title Extractor
This component extracts the title of the paper.

#### Authors Extractor
This component extracts all relevant data regarding the authors of the paper, like their name, email, country and institution of work (company or university).

#### Abstract Extractor
This component extracts all relevant information regarding the abstract section of the paper, not only the actual abstract text but some related fields like the keywords of the paper.

#### Pattern Extractor
This component extracts all patterns that are described on the paper, separating the information by fields, like name, introduction, context, etc.

#### Footer Extractor
This component extracts metadata related to the footer of the paper, like the name and date of the conference where the paper was presented.

#### Recovery Manager
This module is connected to a database, and its goal is to assure that every paper the application receives is correctly parsed and outputed into the queue. The component serves a middleware between the application code and the crash recovery database, and keeps track of all papers that are being currently parsed. That information is used when the system first starts, in order to recover any papers that were not fully processed before.

### Physical Architecture

The goal of this subsection is to document the high-level physical structure of the software system (machines, connections, software components installed, and their dependencies) using UML deployment diagrams or component diagrams (separate or integrated), showing the physical structure of the system.
It should also describe the technologies considered and justify the selections made.

![Phisical Architectrure Diagram](https://i.imgur.com/MMH50Lc.png)

- **Node.js** has been chosen to make the reader component, because it is a technology that every group member is confortable with, thus allowing a faster development and allow the focus to shift towards the business rules and behaviour of the application, eliminating the friction of having to learn a new language/tecnology. Plus, some of the work in last year's project was developed using Node.js, and we intend to try to reutilize some of the code.
- **PostgreSQL** has been chosen for the Crash Recovery DB because it is a well proven technology that, once again, every team member is confortable with; it's secure, expandable, among other advatages. We decided to go with an relational DB technology because the information we intend to store is simple and structured: it probably will be a mapping between a URL and a status flag that indicates if it has been processed or not.

### Class Diagram

![Class Diagram](https://i.imgur.com/rLolYKm.png)

### Interfaces

The module only interfaces with the MQTT queue.

#### Input

The module will subscribe to `papers/gs` and expect the messages to have the following format:

```json=
{
	"url": "https://patterns.com/paper",
}
```

#### Output

The output that the application sends to the queue contains all the extracted information about the paper: title, authors, abstract, patterns and footer. The structure of the object that is outputed to the queue is the following:

```json=
{
     "paper_id": "exampleid00001",	
     "paper_title": "The title of the paper",
     "authors": [
         {
             "name": "The name of the author",
             "email": "Email of the author",
             "organization": "Organization of the author (normally company or university)",
             "country": "Country of the author"
         }
     ],
     "abstract": {
         "text": "Abstract text",
         "categories": ["The paper's categories, that were listed in the abstract section"],
         "general_terms": ["General terms mentioned in the abstract section of the paper"],
         "keywords": ["List of keywords mentioned in the abstract section of the paper"],
         "reference_format": "Reference format mentioned in the paper"
     },
     "patterns": [
         {	
            "name": "Pattern name",
            "introduction": "The pattern’s introduction",
            "intent": "The pattern’s intent",
            "context": "The pattern’s context.",
            "problem": "The pattern’s problem",
            "forces": "The pattern’s forces",
            "solution": "The pattern’s solution",
            "implementation": "The pattern’s implementation",
            "known_uses": "The pattern’s known uses",
            "consequences": "The pattern’s consequences",
            "related_patterns": "The pattern’s related patterns",
            "aliases": "The pattern’s related aliases",
            "resulting_context": "The pattern’s resulting context",
            "example": "The pattern’s application example",
            "variants": "The pattern’s variants",
         }
     ],
     "paper_info": {
         "url": "URL of the parsed paper",
         "conference_name": "Name of the conference where the paper was presented",
         "conference": "acronym for the conference (e.g. PLoP19)"
         "conference_date": "Date of the conference",
         "conference_location": "Location of the conference",
         "copyright": "Copyright text present in the footer of the paper"
     }
}
```

## Development

This section describes how this module can be executed in a development environment.

### Dependencies

In order to execute this module in a local environment, the following dependencies are needed:

* `docker`
* `docker-compose`

They can be installed in Arch Linux using:

```bash
sudo pacman -S docker docker-compose
```

### Environment Variables 

In order to execute this module in a local environment, the following environment variables must be defined in a `.env` file located in the `app/` directory:

| Variable Name | Description | 
| ---- | --- |
| `MQTT_URL` | URL of the MQTT queue | 
|`INPUT_TOPICS` | MQTT Topic to listen to  |
| `OUTPUT_TOPICS` | MQTT topic where the output will be sent |
| `CONFIG_FILE` | Path to the configuration file |
|`TEMP_FILE_PATH`| Path to a directory where downloaded papers will be saved to |
|`POSTGRES_HOST`| Hostname of the Postgres DB |
|`POSTGRES_PORT`| Port number of the Postgres DB |
|`POSTGRES_USER`| Username for the Postgres DB |
|`POSTGRES_PASS`| Password for the Postgres DB |
|`POSTGRES_DB`| Name of the Postgres DB used
|`POSTGRES_RECOV_TABLE`| Name of the DB table used for crash recovery |

### Configuration File 

In order to configure the parser and its operation, a `config.yaml` file is needed with the following format: 

```yaml=
downloading_strat: <fetch | wget> 
types:
    plop:
        url_regex: <regex to parse the url>
        parser:
            type: plain_text
            title_strat: plop
            author_strat: paragraph
            abstract_strat: plop
            pattern_strat: state_machine
            footer_strat: plop
```

Currently only the strategies stated above are supported, however, more can be added in the future.

**Note:** The regular expression `https:\/\/hillside.net\/plop\/\d{4}\/papers\/proceedings\/papers\/.+.pdf` is recomended as a `url_regex`.

### Execution

After the entire setup above is completed, the module can be started by executing the following command from the root directory of the module:

```shell
docker-compose up
```

## Operations

In order to deploy this module, the following container should be added to a `docker-compose.yaml` file that will be invoked in the target machine, integrated with other components:

```yaml=
reader:
    build: ./reader/app
    command: npm start
    env_file:
      - ./reader/app/.env.prod
    depends_on:
      - mosquitto

```

Then, the target machine should execute the following command to initialize all containers, for example from CI runner:

```shell 
docker-compose -f <yaml path> up -d --build
```

The `-f` flag specifies a specific path for the `.yaml` file, the `-d` flag starts all containers in *detached* mode and the `--build` flag forces a build of all containers. 

**Note:** The `.env.prod` file is a file with the same structure as the `.env` file specified in the previous section.