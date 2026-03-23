# Client Requirements – Workload Verification System

## 1. Overview

This document outlines the agreed requirements for the Workload Verification System based on discussions with the client, Daniela Roberts.

The system aims to improve the current manual workload verification process by introducing a structured, transparent, and centralized platform for managing and reviewing academic workload data.

---

## 2. Current System Understanding

The current workload management process consists of three main stages:

### 2.1 Source Data

Workload-related data is collected from multiple sources, including:

* Staff information
* Unit information
* Service and role data

### 2.2 Data Entry

Administrative staff manually input workload allocations into spreadsheet tabs such as:

* Teaching
* HDR Supervision
* Assigned Roles

### 2.3 Report Generation

Spreadsheet formulas generate reports including:

* Staff workload summaries
* Unit workload distributions
* Enrolment-based analysis
* Overall school summaries

---

## 3. Problem Statement

The existing system presents several challenges:

* **Inefficient workflow**: Heavy reliance on manual data entry and email communication
* **Data inconsistency risks**: Errors may occur due to unsynchronised updates across spreadsheets
* **Limited transparency**: Academic staff have restricted visibility into workload calculations
* **Poor change tracking**: No structured way to track corrections or revisions
* **Security concerns**: Sharing data via email increases risk of unauthorised access
* **Lack of insights**: Difficult to generate reports for decision-making

---

## 4. System Goals

The system is intended to:

* Verify the correctness of workload data
* Improve efficiency of workload review processes
* Reduce reliance on email communication
* Enhance transparency for academic staff
* Provide a structured and secure platform for managing workload data

---

## 5. Functional Requirements

### 5.1 Data Parsing

* Import workload data from existing spreadsheet files
* Extract relevant information from structured sheets (e.g., Teaching, HDR, Roles)

---

### 5.2 Automated Data Validation

The system must detect potential errors, including:

* Missing values in required fields
* Incorrect workload totals
* Inconsistencies between related data sheets
* Invalid workload allocations (e.g., mismatch with FTE)
* Division errors (e.g., #DIV/0)
* Duplicate or conflicting entries

---

### 5.3 Role-Based Access Control

The system must support the following roles:

* **Academic Staff**

  * Can view only their own workload data
  * Can submit queries or correction requests

* **Head of Department**

  * Can view workload data for staff within their department
  * Can review and respond to queries

* **School Operations / Senior Coordinator**

  * Can view all workload data
  * Can monitor system-wide issues

* **Head of School**

  * Can view all workload data
  * Can approve final workload allocations

---

### 5.4 Workload Review Interface

* Provide a user-friendly interface for viewing workload data
* Present workload information in a clear and structured format
* Allow users to easily identify issues and discrepancies

---

### 5.5 Query Submission and Workflow

* Academic staff can submit queries or correction requests
* Queries are:

  * Visible to relevant administrative roles
  * Tracked within the system
  * Managed through an approval or response process

---

### 5.6 Reporting

The system should provide summary views including:

* Individual staff workload summaries
* Department-level summaries
* School-wide workload overview

---

### 5.7 Data Export

* Support export of reports in PDF format (optional for MVP)

---

## 6. Non-Functional Requirements

### 6.1 Security and Privacy

* Ensure users can only access data relevant to their role
* Protect sensitive staff information through controlled access

---

### 6.2 Usability

* Provide a simple and intuitive interface for both academic and administrative users

---

### 6.3 Performance

* Efficiently process spreadsheet data and generate results without significant delays

---

### 6.4 Scalability

* The system should be designed to accommodate increasing numbers of staff and workload components

---

## 7. Assumptions

* The structure of the spreadsheet (sheet names and column headers) will remain consistent for the MVP
* The system will initially support one School/ROE with multiple departments
* Dummy data provided by the client represents the actual structure used in practice

---

## 8. Key Insight

The system is not intended to replace existing spreadsheet calculations.
Instead, it acts as a verification and review layer that ensures data accuracy, improves workflow efficiency, and enhances transparency.

---

