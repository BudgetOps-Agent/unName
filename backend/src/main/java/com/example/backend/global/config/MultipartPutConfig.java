package com.example.backend.global.config;

import org.apache.catalina.Context;
import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * PUT/PATCH 요청에서도 multipart/form-data(파일 업로드)를 파싱하도록 Tomcat 설정을 켠다.
 *
 * Tomcat은 기본적으로 POST 요청만 multipart를 파싱한다. 지출 수정(API-018)이 PUT + 파일 교체라,
 * 이 설정이 없으면 PUT으로 보낸 영수증 파일이 null로 들어온다(파트가 파싱되지 않음).
 * allowCasualMultipartParsing = true로 POST 외 메서드의 multipart도 파싱하게 허용한다.
 */
@Configuration
public class MultipartPutConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> allowPutMultipart() {
        return factory -> factory.addContextCustomizers(
                (Context context) -> context.setAllowCasualMultipartParsing(true)
        );
    }
}
