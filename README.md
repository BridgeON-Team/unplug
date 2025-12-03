# UnPlug

## ⚡프로젝트 소개 
- AI를 활용한 스마트폰 디톡스 앱 서비스
- 스마트폰 보급률이 99%에 달하는 현재. 현대인의 스마트폰 과의존으로 인한 부정적인 영향이 더욱 커지고 있다. 이에 따라 최근 스마트폰 디톡스라는 개념이 등장하여, 일정 시간 스마트폰 사용을 제한하거나 줄이는 움직임이 일어나고 있다.
- 이러한 스마트폰 디톡스를 돕기 위해 사용자 스스로 스마트폰 사용 습관을 형성하고 통제할 수 있도록 기획하게 되었다.

<br>

##  ⚡프로젝트 개요
- 프로젝트 기간: 2025.09 ~ 2025.11
- 목표: 스마트폰 과의존과 중족 문제를 완화, 청년층과 학생들 중심으로 자기 통제적 스마트폰 사용을 가능하게 돕고자 함.
- 목적: AI를 활용한 챗봇, 제한도구 및 설문 조사를 통한 스마트폰 디톡스 앱 개발

<br>

##  👨‍👩‍👧‍👦팀원 구성

| [김민정(T)](https://github.com/minjung415)| [김태연](https://github.com/corykim2) | [최기원](https://github.com/tengo99) | [정현수](https://github.com/hyun9758) |  [김민규](https://github.com/iosif2) |
| -- | -- | -- | -- | -- |
| <img src="https://avatars.githubusercontent.com/u/149349369?v=4" width="200"> | <img src="https://avatars.githubusercontent.com/u/69044424?v=4" width="200"> | <img src="https://avatars.githubusercontent.com/u/104974710?v=4" width="200"> | <img src="https://avatars.githubusercontent.com/u/82191626?v=4" width="200"> | <img src="https://avatars.githubusercontent.com/u/54474221?v=4" width="200"> | 

## 🛠️시스템 아키텍처
### FE: 
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37) ![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)
### BE:
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white) ![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white) 	![Gradle](https://img.shields.io/badge/Gradle-02303A.svg?style=for-the-badge&logo=Gradle&logoColor=white) 	![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
### DB: 
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
### ENVIRONMENT & SERVER: 	
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) 	![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
<br>

## 페이지별 기능

### 0) 로그인, 회원가입 
- 아이디와 비밀번호를 입력하여 로그인이 가능합니다.
- 자체 아이디와 비밀번호를 사용하고 있기 때문에 중복 확인 후 회원가입이 가능합니다.

|로그인|회원가입|
|-------|-------|
|<<img width="345" height="750" alt="image" src="https://github.com/user-attachments/assets/3c982e60-796f-4eb3-ad39-e590e796b321" />|<img width="345" height="750" alt="image" src="https://github.com/user-attachments/assets/84ce4902-1170-4dd0-a442-227f053ba741" />|

<br>

### 1) 스마트폰 자가 진단 설문 
- 스마트폰 사용 설문 질문 10개를 통해 사용자의 중독 유형을 나눕니다.
- 이를 통해 사용자에게 필요한 디톡스 유형을 추천합니다.
  
|자가진단|
|---------|
|<img width="652" height="667" alt="image" src="https://github.com/user-attachments/assets/c4d61d2f-9208-4159-81f9-f175232b7139" />|

<br>

### 2) 스마트폰 디톡스 챌린지
- 모임이나 챌린지를 생성할 수 있습니다. 모임과 챌린지 모두 전체, 참여가능, 참여중으로 분류되며 생성 또한 가능합니다.
- 챌린지: 투두(to-do) 리스트처럼 본인에게 필요한 목표를 생성하고 실행한 이후에 사용자가 자유롭게 체크하거나 삭제가 가능합니다. 
 
|디톡스 챌린지|
|--------------|
|<img width="997" height="650" alt="image" src="https://github.com/user-attachments/assets/ed369a20-3902-48f6-becb-045841687697" />|


### 3) 스마트폰 디톡스 모임 
- 모임 또한 동일하게 전체, 참여 가능, 참여중으로 필터링이 가능합니다.
- 모임을 생성하면 사람을 모아서 함께 공동 목표를 진행할 수 있고, 좋아요 기능을 사용하여 반응을 보낼 수 있습니다.
- 모임과 챌린지는 연동하여 시작할 수 있습니다.

|디톡스 모임|
|---|
|<img width="1007" height="657" alt="image" src="https://github.com/user-attachments/assets/71b6bc64-49a2-48bc-a9c2-fb75634a4522" />|
<br>

### 4) AI 활용 챗봇
- 자체 AI 챗봇을 통해 사용자는 디톡스에 대한 고민, 챌린지 추천 등을 자유롭게 채팅 형식으로 사용할 수 있습니다.

|챗봇|
|---|
|<img width="307" height="661" alt="image" src="https://github.com/user-attachments/assets/8454f7e2-8000-487c-9b6d-2897850b5f68" />|

<br>
