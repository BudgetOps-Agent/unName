// 회원 관련 비즈니스 로직 처리

// 1. package
package com.example.backend.member.service;

// 2. import
import com.example.backend.global.jwt.JwtProvider;
import com.example.backend.global.jwt.RefreshTokenRepository;
import com.example.backend.member.dto.*;
import com.example.backend.member.entity.User;
import com.example.backend.member.entity.UserStatus;
import com.example.backend.member.exception.MemberErrorCode;
import com.example.backend.member.exception.MemberException;
import com.example.backend.member.repository.UserRepository;
import com.example.backend.team.entity.Team;
import com.example.backend.teamMember.entity.TeamMember;
import com.example.backend.teamMember.entity.TeamStatus;
import com.example.backend.teamMember.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;

// 3. 클래스 어노테이션
// @Service
// @RequiredArgsConstructor
@Service // 비즈니스 로직 담당한다고 알려주는 어노테이션 이걸 사용하면 Spring이 자동으로 Bean으로 등록해줌
@RequiredArgsConstructor // final 필드 생성자 자동 생성해주는 어노테이션 이걸 쓰면 생성자 직접 안써도 됨
public class UserService {// 4. 클래스 선언

    // 5. Repository 주입
    // UserRepository
    private final UserRepository userRepository;

    // 6. Bean 주입
    // PasswordEncoder
    private final PasswordEncoder passwordEncoder;

    // Jwt 주입
    private final JwtProvider jwtProvider;

    // 마이페이지에서 모임 조회할때 사용
    private final TeamMemberRepository teamMemberRepository;


    // 7. 회원가입 메서드
    // signup()
//    @Transactional // DB 계속 사용 할 수 있게 열어놓기
    private final RefreshTokenRepository refreshTokenRepository;

    // 7. 회원가입 메서드
    // signup()
    @Transactional
    public SignupResponse signup(SignupRequest request) {

//        // 아이디 중복 검사(DB에 같은 아이디가 있으면 이미 사용중인 아이디입니다 던지고 중단)
//        if (userRepository.existsByUserId(request.getUserId())) {
//            throw new MemberException(MemberErrorCode.DUPLICATE_USER_ID);
//        }

        // 공백 제거 및 형식 통일
        String email = request.getEmail().trim().toLowerCase();
        String name = request.getName().trim();
        String phone = request.getPhone()
                .replace("-", "")
                .trim();

        // 이메일 중복 검사(DB에 같은 이메일이 있으면 이미 사용중인 이메일입니다 던지고 중단)
        if (userRepository.existsByEmail(email)) {
            throw new MemberException(MemberErrorCode.DUPLICATE_EMAIL);
        }

        // 전화번호 중복 검사(DB에 같은 이메일이 있으면 이미 사용중인 이메일입니다 던지고 중단)
        if (userRepository.existsByPhone(phone)) {
            throw new MemberException(MemberErrorCode.DUPLICATE_PHONE);
        }

        // 생년월일 오늘 날짜 이전 검증
        if (request.getBirthDate().isAfter(LocalDate.now())) {
            throw new MemberException(MemberErrorCode.INVALID_BIRTH_DATE);
        }

        // 비밀번호 암호화(클라이언트가 비밀번호를 보내면 그걸 암호화된 문자열로 변환시켜서 디비에 저장)
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // User 엔티티 생성 (entity에서 호출)
        User user = User.create(
                encodedPassword,
                email,
                name,
                request.getBirthDate(),
                phone
        );

        // DB 저장
        userRepository.save(user);

        // SignupResponse 반환
        return SignupResponse.builder()
                .success(true)
                .user(SignupResponse.UserResponse.fromEntity(user))
                .build();
    }

    public LoginResult login(LoginRequest request) {

        // 이메일로 유저 조회
        User user = userRepository.findByEmail(request.getEmail()) // findByEmail() DB에서 email로 유저 찾기
                // Optional<User> 반환이라서 .orElseThrow() 붙임
                // 이메일 없으면 예외 던지고 중단
                .orElseThrow(() -> new MemberException(MemberErrorCode.MEMBER_NOT_FOUND));

        // 비밀번호 확인
        // request.getPassword() 클라이언트가 보낸 비밀번호
        // user.getPasswordHash() DB에 저장된 암호화된 비밀번호
        // 두개를 비교해서 검증
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new MemberException(MemberErrorCode.MEMBER_NOT_FOUND); // 일치하지 않으면 예외 던지기
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new MemberException(MemberErrorCode.INACTIVE_MEMBER);
        }

        // 토큰 생성
        // 로그인 성공 했으니깐 JWT 토큰 생성
        // String token = jwtProvider.generateToken(user.getEmail(), user.getRole()); // 이메일이랑, 권한 넣어서 토큰 만들기

        String accessToken = jwtProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtProvider.generateRefreshToken(user.getEmail());

        refreshTokenRepository.save(user.getEmail(), refreshToken);

        // LoginResponse 반환 (성공 여부,토큰,유저 정보 담아서 반환)
        LoginResponse response = LoginResponse.builder()
                .success(true)
                // .token(token)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build())
                .build();

        return new LoginResult(response, accessToken, refreshToken);
    }

    public LoginResult reissue(String refreshToken) {

        if (!jwtProvider.isRefreshToken(refreshToken)) {
            throw new MemberException(MemberErrorCode.INVALID_REFRESH_TOKEN);
        }

        String email = jwtProvider.getEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        if (!refreshTokenRepository.find(email).equals(refreshToken)) {
            refreshTokenRepository.delete(email);
            throw new MemberException(MemberErrorCode.REUSED_REFRESH_TOKEN);
        }

        String newAccessToken = jwtProvider.generateAccessToken(user.getEmail());
        String newRefreshToken = jwtProvider.generateRefreshToken(user.getEmail());

        refreshTokenRepository.save(user.getEmail(), newRefreshToken);

        LoginResponse response = LoginResponse.builder()
                .success(true)
                .user(LoginResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build())
                .build();

        return new LoginResult(response, newAccessToken, newRefreshToken);
    }


    public FindIdResponse findId(FindIdRequest request) {

        // 공백 제거 및 형식 통일
        String name = request.getName().trim();
        String phone = request.getPhone()
                .replace("-", "")
                .trim();

        // 이름, 전화번호로 유저 조회
        User user = userRepository.findByNameAndPhone(name, phone)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // FindIdResponse 반환
        return FindIdResponse.builder()
                .success(true)
                .email(user.getEmail())
                .build();
    }

    public VerifyUserResponse verifyUser(VerifyUserRequest request) {

        User user = userRepository.findByEmailAndName(
                        request.getEmail(),
                        request.getName())
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        String verifyToken = jwtProvider.generateVerifyToken(user.getEmail());

        // VerifyUserResponse 반환
        return VerifyUserResponse.builder()
                .success(true)
                .message("사용자 확인이 완료되었습니다.")
                .verifyToken(verifyToken)
                .build();
    }

    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {

        if (!jwtProvider.isVerifyToken(request.getVerifyToken())) {
            throw new MemberException(MemberErrorCode.INVALID_VERIFY_TOKEN);
        }

        String tokenEmail = jwtProvider.getEmail(request.getVerifyToken());

        if(!tokenEmail.equals(request.getEmail())) {
            throw new MemberException(MemberErrorCode.INVALID_VERIFY_TOKEN);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new MemberException((MemberErrorCode.USER_NOT_FOUND)));

        // 기존 비밀번호와 동일한지 검증
        if(passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new MemberException(MemberErrorCode.SAME_PASSWORD);
        }

        // 새 비밀번호 암호화(회원가입 할때처럼)
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());

        // 비밀번호 변경(업데이트)
        user.updatePassword(encodedPassword);

        // DB 저장
        userRepository.save(user);

        return ResetPasswordResponse.builder()
                .success(true)
                .message("비밀번호가 변경되었습니다.")
                .build();
    }

    public void logout() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        refreshTokenRepository.delete(email);
    }

    // 마이페이지 조회 (API-013)
    // 로그인한 사람의 기본 정보 + 소속 모임 목록을 같이 내려줌
    // Team이 지연로딩(LAZY)이라 안에서 team.getName() 등을 쓰려면 세션이 살아있어야 함
    // @Transactional(readOnly = true)로 세션 유지 (API-009 getMyTeams()랑 같은 이유)
    @Transactional(readOnly = true)
    public MyPageResponse getMyPage() {
        
        // 1. JWT 토큰에서 현재 로그인한 사람 이메일 꺼내기
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. 이메일로 유저 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new MemberException(MemberErrorCode.USER_NOT_FOUND));

        // 3. User 엔티티 → UserInfo(DTO)로 변환
        MyPageResponse.UserInfo userInfo = MyPageResponse.UserInfo.fromEntity(user);

        // 4. 내가 ACCEPTED(수락)인 모임 목록 가져오기 (TeamMemberRepository 재사용)
        List<TeamMember> acceptedMembers = teamMemberRepository
                .findByUserIdAndStatusOrderByJoinedAtDesc(user.getId(), TeamStatus.ACCEPTED);

        // 5. 각 TeamMember마다 Team, memberCount 조회해서 TeamInfo로 변환
        List<MyPageResponse.TeamInfo> teams = acceptedMembers.stream()
                .map(teamMember -> {
                    Team team = teamMember.getTeam();

                    long memberCount = teamMemberRepository
                            .countByTeamIdAndStatus(team.getId(), TeamStatus.ACCEPTED);

                    return MyPageResponse.TeamInfo.builder()
                            .teamId(team.getId())
                            .name(team.getName())
                            .memberCount(memberCount)
                            .role(teamMember.getRole().name())
                            .build();
                })
                .collect(Collectors.toList());

        // 6. 응답 반환
        return MyPageResponse.builder()
                .success(true)
                .user(userInfo)
                .teams(teams)
                .build();
    }
}
/**
 * UserService 역할 : 회원 관련 비즈니스 로직을 처리한다.
 *
 * 사용 예시
 *
 * 회원가입
 * ↓
 * signup()
 *
 * 처리 순서
 *
 * Controller
 * ↓
 * signup() 호출
 * ↓
 * 아이디 중복 검사 existsByUserId()
 * ↓
 * 이메일 중복 검사 existsByEmail()
 * ↓
 * 비밀번호 암호화 passwordEncoder.encode()
 * ↓
 * User 엔티티 생성
 * ↓
 * DB 저장 userRepository.save()
 * ↓
 * SignupResponse 생성
 * ↓
 * Controller 반환
 */