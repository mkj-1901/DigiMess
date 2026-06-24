# DigiMess UML Diagrams

This directory contains the system architecture and flow diagrams for the DigiMess application, written in PlantUML.

Since GitHub does not render `.puml` files natively, we are using the PlantUML Proxy service to dynamically render these diagrams directly in this README.

*(Note: The diagrams will appear once these `.puml` files are pushed to the `main` branch of your GitHub repository).*

## 1. Entity-Relationship (ER) Diagram
This diagram outlines the database schema (MongoDB/Mongoose models) and relationships.

![ER Diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mkj-1901/DigiMess/main/UML%20Diagrams/ER.puml)

## 2. Class Diagram
Represents the system's conceptual structure, including Controllers, Models, and the ML Summarizer service.

![Class Diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mkj-1901/DigiMess/main/UML%20Diagrams/Class.puml)

## 3. Sequence Diagram
Demonstrates the API call flow between the Frontend, Backend APIs, MongoDB, and the ONNX ML engine.

![Sequence Diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mkj-1901/DigiMess/main/UML%20Diagrams/Sequence.puml)

## 4. Activity Diagram
Shows the system workflows for Students and Admins, from logging in to analyzing data.

![Activity Diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mkj-1901/DigiMess/main/UML%20Diagrams/Activity.puml)

## 5. Use Case Diagram
Highlights the primary system capabilities accessible by each user role.

![Use Case Diagram](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/mkj-1901/DigiMess/main/UML%20Diagrams/UseCase.puml)
