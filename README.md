# abohang

## 📌 아보행 (ABOHANG)

**아보행**은 사용자가 다양한 데이터를 효율적으로 관리하고 직관적으로 활용할 수 있도록 돕는 **데이터 관리 및 API 설계 프로젝트**입니다. 이 프로젝트는 다음과 같은 목적과 기능을 중심으로 설계되었습니다.

---

### ✨ 프로젝트 목적

1. **효율적인 데이터 관리**: 복잡한 데이터 구조를 단순화하고 관계형 데이터베이스(RDBMS)를 통해 데이터를 체계적으로 관리.
2. **API 설계 및 구현**: 클라이언트와 서버 간의 원활한 통신을 위한 RESTful API를 설계.
3. **유연한 확장성**: 다양한 데이터 구조를 지원하고, 확장 가능한 백엔드 아키텍처 구축.

---

### 🛠️ 주요 기능

1. **사용자 관리 기능**
   - 사용자 등록, 로그인, 정보 조회 및 수정 기능.
   - 비밀번호 암호화를 통한 보안 강화.

2. **기록 관리 기능**
   - 사용자의 기록(데이터) 생성, 조회, 수정, 삭제(CRUD).
   - 파일 업로드 및 데이터 저장(로컬 또는 클라우드 연동).

3. **데이터 시각화**
   - 사용자의 데이터를 차트나 그래프로 시각화하여 분석 지원.

4. **통합 API 제공**
   - RESTful API를 통해 외부 클라이언트(프론트엔드, 모바일 앱 등)와의 원활한 통신.

---

### 🖥️ 기술 스택

- **프론트엔드**: React.js (예시, 해당 프로젝트와 맞는 스택으로 변경 가능)
- **백엔드**: Node.js, Express.js
- **데이터베이스**: MySQL
- **배포**: AWS 또는 Heroku
- **기타 도구**: Postman (API 테스트), GitHub (버전 관리)

---

### 📂 폴더 구조

```
📦 프로젝트 루트
├── Back-End
│   ├── controllers/     # API 비즈니스 로직
│   ├── models/          # 데이터베이스 모델
│   ├── routes/          # API 라우팅
│   ├── config/          # 환경 변수 및 DB 설정
│   ├── app.js           # Express 서버 초기화
│   └── package.json     # npm 의존성 관리
└── .env                # 환경 변수 파일
```

---

### 🚀 설치 및 사용법

1. **프로젝트 클론**
   ```bash
   git clone https://github.com/사용자명/레포명.git
   cd 레포명/Back-End
   ```

2. **패키지 설치**
   ```bash
   npm install
   ```

3. **데이터베이스 설정**
   - MySQL에서 새로운 데이터베이스 생성:
     ```sql
     CREATE DATABASE abohang_db;
     ```
   - `.env` 파일에 아래 내용을 추가:
     ```
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=abohang_db
     ```

4. **서버 실행**
   ```bash
   npm start
   ```

5. **API 테스트**
   - Postman이나 Curl을 통해 API를 테스트합니다.
   - 예시: 사용자 등록 API 호출
     ```bash
     POST /api/users/register
     Body: { "username": "test", "email": "test@example.com", "password": "123456" }
     ```

---

### 📑 API 명세서

| 메서드 | 경로                | 설명                   | 요청 값                        | 응답 값                     |
|--------|---------------------|------------------------|--------------------------------|-----------------------------|
| `POST` | `/api/users/register` | 사용자 등록           | `username`, `email`, `password` | 성공 메시지                |
| `POST` | `/api/users/login`   | 사용자 로그인         | `email`, `password`            | JWT 토큰                   |
| `GET`  | `/api/records`       | 사용자 기록 조회      | `Authorization` 헤더          | 기록 데이터 배열            |
| `POST` | `/api/records`       | 사용자 기록 추가      | `title`, `content`             | 생성된 기록 데이터          |

---



### 📌 기여 방법

1. 해당 프로젝트를 포크합니다.
2. 새로운 브랜치를 생성합니다.
   ```bash
   git checkout -b feature/새기능명
   ```
3. 변경 사항을 커밋합니다.
   ```bash
   git commit -m "새 기능 추가 설명"
   ```
4. 푸시하고 Pull Request를 생성합니다.


