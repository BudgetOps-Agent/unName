# ─────────────────────────────────────────────────────────────
# 백엔드 도커 이미지 (멀티스테이지 빌드)
#  1) build 단계: JDK로 gradle 빌드해서 jar 하나 뽑음
#  2) run 단계  : 가벼운 JRE 이미지에 그 jar만 복사해서 실행
#  이렇게 나누면 최종 이미지에 빌드도구(gradle 등)가 안 들어가서 크기가 작아짐
# ─────────────────────────────────────────────────────────────

# 1) 빌드 단계 ────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# gradle wrapper와 설정 먼저 복사 (의존성 캐시 레이어 활용)
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew

# 소스 복사
COPY src src

# bootJar만 빌드 (plain jar는 안 만들어져서 아래 *.jar 글롭이 안전함)
# -x test : 배포 빌드에선 테스트 스킵 (프리티어 메모리 아끼려고)
RUN ./gradlew clean bootJar -x test --no-daemon

# 2) 실행 단계 ────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# 빌드 단계에서 만든 jar 하나만 가져옴
COPY --from=build /app/build/libs/*.jar app.jar

# prod 프로필로 실행. JAVA_OPTS로 힙 메모리 제한(프리티어 1GB 대비)
# 기본값은 compose에서 넘기고, 여기선 없으면 최소값으로
ENV JAVA_OPTS="-Xmx384m -Xms128m"
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

# sh -c 를 써야 JAVA_OPTS 환경변수가 펼쳐짐
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
