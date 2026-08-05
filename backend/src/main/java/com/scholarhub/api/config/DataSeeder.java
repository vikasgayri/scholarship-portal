package com.scholarhub.api.config;

import com.scholarhub.api.domain.Role;
import com.scholarhub.api.domain.Scholarship;
import com.scholarhub.api.domain.ScholarshipStatus;
import com.scholarhub.api.domain.User;
import com.scholarhub.api.repository.ScholarshipRepository;
import com.scholarhub.api.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final String DEFAULT_ADMIN_EMAIL = "vikasgayri@gmail.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "vikas1234";
    private static final List<String> LEGACY_ADMIN_EMAILS = List.of(
            "admin@scholarhub.com",
            "vikasgayri@gmail.com");

    private final UserRepository userRepository;
    private final ScholarshipRepository scholarshipRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedScholarships();
    }

    private void seedAdmin() {
        if (userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent()) {
            userRepository.findByEmail(DEFAULT_ADMIN_EMAIL)
                    .ifPresent(admin -> saveAdmin(admin, DEFAULT_ADMIN_EMAIL));
            return;
        }

        for (String legacyEmail : LEGACY_ADMIN_EMAILS) {
            if (userRepository.findByEmail(legacyEmail).isPresent()) {
                userRepository.findByEmail(legacyEmail)
                        .ifPresent(admin -> saveAdmin(admin, DEFAULT_ADMIN_EMAIL));
                return;
            }
        }

        userRepository.save(User.builder()
                .name("ScholarHub Admin")
                .email(DEFAULT_ADMIN_EMAIL)
                .passwordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                .role(Role.ADMIN)
                .course("Administration")
                .phoneNumber("+91 6350022000")
                .city("Udaipur")
                .state("Rajasthan")
                .profileComplete(true)
                .emailVerified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());
    }

    private void saveAdmin(User admin, String email) {
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        admin.setEmailVerified(true);
        admin.setUpdatedAt(Instant.now());
        userRepository.save(admin);
    }

    private void seedScholarships() {
        if (scholarshipRepository.count() > 0) {
            return;
        }

        scholarshipRepository.saveAll(List.of(
                buildScholarship(
                        "National Scholarship Scheme",
                        "Ministry of Education",
                        "Central support for meritorious students from economically weaker families pursuing higher education.",
                        "Indian students with at least 60% marks and annual family income below the notified limit.",
                        "Merit",
                        "https://scholarships.gov.in/",
                        new BigDecimal("50000"),
                        500,
                        LocalDate.now().plusMonths(3),
                        true,
                        "Pan India"),
                buildScholarship(
                        "PM Scholarship Scheme",
                        "Prime Minister's Scholarship Board",
                        "Financial assistance for eligible wards pursuing professional degree programs.",
                        "Students admitted to AICTE, UGC, or medical council recognized professional courses.",
                        "Government",
                        "https://ksb.gov.in/pmss.htm",
                        new BigDecimal("36000"),
                        250,
                        LocalDate.now().plusMonths(2),
                        true,
                        "Pan India"),
                buildScholarship(
                        "Post Matric Scholarship",
                        "Department of Social Justice",
                        "Post-matric support for students continuing studies after class 10 in recognized institutions.",
                        "Reserved category students with valid caste certificate and income eligibility.",
                        "Post Matric",
                        "https://scholarships.gov.in/",
                        new BigDecimal("24000"),
                        800,
                        LocalDate.now().plusMonths(4),
                        false,
                        "State and National"),
                buildScholarship(
                        "Merit Cum Means Scholarship",
                        "Minority Affairs Ministry",
                        "Need-aware merit scholarship for technical and professional courses.",
                        "Minority community students with strong academics and eligible household income.",
                        "Minority",
                        "https://www.minorityaffairs.gov.in/",
                        new BigDecimal("30000"),
                        400,
                        LocalDate.now().plusMonths(3),
                        true,
                        "Pan India"),
buildScholarship("Central Sector Scholarship", "Department of Higher Education", "Annual scholarship for top-performing class 12 graduates entering college.", "Students above the 80th percentile in class 12 with regular college admission.", "Merit", "https://scholarships.gov.in/", new BigDecimal("20000"), 820, LocalDate.now().plusMonths(5), true, "Pan India"),
buildScholarship("AICTE Pragati Scholarship", "AICTE", "Encourages girl students to pursue technical diploma and degree education.", "Girl students admitted to first year technical diploma or degree courses.", "Women Education", "https://www.aicte-india.org/", new BigDecimal("50000"), 300, LocalDate.now().plusMonths(2), true, "Pan India"),
buildScholarship("AICTE Saksham Scholarship", "AICTE", "Support for specially abled students pursuing technical education.", "Students with benchmark disability admitted to AICTE-approved institutions.", "Accessibility", "https://www.aicte-india.org/", new BigDecimal("50000"), 120, LocalDate.now().plusMonths(2), false, "Pan India"),
buildScholarship("INSPIRE Scholarship", "Department of Science and Technology", "Scholarship for students pursuing basic and natural sciences.", "Top science students enrolled in BSc, BS, integrated MSc, or MS programs.", "Science", "https://online-inspire.gov.in/", new BigDecimal("80000"), 150, LocalDate.now().plusMonths(6), true, "Pan India"),
buildScholarship("NSP Top Class Education Scholarship", "National Scholarship Portal", "Premium support for tuition and living costs in top institutions.", "Eligible students admitted to notified top-class institutions through regular selection.", "Need Based", "https://scholarships.gov.in/", new BigDecimal("75000"), 220, LocalDate.now().plusMonths(4), false, "Pan India"),
buildScholarship("Rajasthan Uttar Matric Scholarship", "Government of Rajasthan", "State scholarship for Rajasthan students pursuing post-matric education.", "Rajasthan domicile students meeting category and income requirements.", "Rajasthan", "https://sso.rajasthan.gov.in/", new BigDecimal("28000"), 450, LocalDate.now().plusMonths(3), false, "Rajasthan"),
buildScholarship("Minority Education Scholarship", "Minority Welfare Foundation", "Tuition assistance for minority students in school, college, and professional programs.", "Minority students with 50% or higher marks and valid income certificate.", "Minority", "https://scholarships.gov.in/", new BigDecimal("25000"), 360, LocalDate.now().plusMonths(4), false, "Pan India"),
buildScholarship("SC Higher Education Scholarship", "Social Justice Department", "Financial support for Scheduled Caste students in recognized higher education programs.", "SC students with domicile, caste certificate, and eligible annual family income.", "SC", "https://scholarships.gov.in/", new BigDecimal("32000"), 500, LocalDate.now().plusMonths(5), false, "Pan India"),
buildScholarship("ST Higher Education Scholarship", "Tribal Affairs Department", "Scholarship for Scheduled Tribe students pursuing higher education.", "ST students enrolled in recognized institutions with valid category documents.", "ST", "https://tribal.nic.in/", new BigDecimal("34000"), 420, LocalDate.now().plusMonths(4), false, "Pan India"),
buildScholarship("OBC Post Matric Scholarship", "Backward Classes Welfare Board", "Need-based post-matric support for eligible OBC students.", "OBC students with income certificate and admission to a recognized course.", "OBC", "https://scholarships.gov.in/", new BigDecimal("26000"), 520, LocalDate.now().plusMonths(3), false, "Pan India"),
buildScholarship("EWS Education Assistance", "Education Access Trust", "Assistance for economically weaker section students pursuing graduation.", "EWS students with valid certificate and at least 55% marks in the previous exam.", "EWS", "https://scholarships.gov.in/", new BigDecimal("30000"), 280, LocalDate.now().plusMonths(5), false, "Pan India"),
buildScholarship("National Sports Scholarship", "Sports Development Authority", "Supports student athletes balancing competitive sports and formal education.", "State or national-level athletes enrolled in school, college, or university.", "Sports", "https://yas.nic.in/", new BigDecimal("60000"), 90, LocalDate.now().plusMonths(2), true, "Pan India"),
buildScholarship("Undergraduate Research Fellowship", "Innovation Research Council", "Research grant for undergraduate students working with faculty mentors.", "Students with a research proposal, mentor endorsement, and strong academic record.", "Research", "https://dst.gov.in/", new BigDecimal("100000"), 60, LocalDate.now().plusMonths(6), true, "Pan India"),
buildScholarship("Women Education Scholarship", "Future Women Foundation", "Supports women continuing undergraduate or postgraduate education.", "Women students with financial need and confirmed admission to a recognized institution.", "Women Education", "https://scholarships.gov.in/", new BigDecimal("45000"), 180, LocalDate.now().plusMonths(4), true, "Pan India"),
buildScholarship("Engineering Excellence Scholarship", "Engineers India Education Trust", "Merit scholarship for students in engineering and technology programs.", "Engineering students with at least 70% marks and no active backlogs.", "Engineering", "https://www.aicte-india.org/", new BigDecimal("75000"), 140, LocalDate.now().plusMonths(5), true, "Pan India"),
buildScholarship("Medical Studies Scholarship", "Health Education Foundation", "Tuition support for MBBS, BDS, nursing, pharmacy, and allied health students.", "Medical and allied health students with merit rank and income eligibility.", "Medical", "https://www.nmc.org.in/", new BigDecimal("90000"), 110, LocalDate.now().plusMonths(3), true, "Pan India"),
buildScholarship("Rural Rising Fund", "Community Growth Foundation", "Need-based financial support for students from rural communities.", "Applicants from rural communities with household income below the threshold.", "Need Based", "https://scholarships.gov.in/", new BigDecimal("35000"), 200, LocalDate.now().plusMonths(2), false, "Rural Districts"),
buildScholarship("First Generation Learner Grant", "BrightPath Initiative", "Helps first-generation college students pay tuition, books, and exam fees.", "Students whose parents or guardians have not completed a college degree.", "Need Based", "https://scholarships.gov.in/", new BigDecimal("40000"), 160, LocalDate.now().plusMonths(4), false, "Pan India"),
buildScholarship("Digital India Technology Scholarship", "Digital Skills Council", "Support for students learning software, data, cybersecurity, and cloud computing.", "Students enrolled in recognized technology programs with project portfolio evidence.", "Technology", "https://www.digitalindia.gov.in/", new BigDecimal("65000"), 130, LocalDate.now().plusMonths(5), true, "Pan India"),
buildScholarship("Teacher Training Scholarship", "Education Futures Trust", "Scholarship for B.Ed., D.El.Ed., and teacher education candidates.", "Teacher education students with admission confirmation and community service interest.", "Education", "https://www.education.gov.in/", new BigDecimal("42000"), 95, LocalDate.now().plusMonths(3), false, "Pan India"),
buildScholarship("Green Energy Fellowship", "Clean Future Foundation", "Fellowship for students researching renewable energy and sustainability.", "Students with a renewable energy, environment, or sustainability research proposal.", "Research", "https://mnre.gov.in/", new BigDecimal("120000"), 45, LocalDate.now().plusMonths(6), false, "Pan India")
            ));
    }

    private Scholarship buildScholarship(
        String title,
        String provider,
        String description,
        String eligibility,
        String category,
        String officialWebsite,
        BigDecimal amount,
        int seats,
        LocalDate deadline,
        boolean featured,
        String location) {
        return Scholarship.builder()
        .title(title)
        .provider(provider)
        .description(description)
        .eligibility(eligibility)
        .category(category)
        .officialWebsite(officialWebsite)
        .amount(amount)
        .seats(seats)
        .deadline(deadline)
        .status(ScholarshipStatus.OPEN)
        .featured(featured)
        .location(location)
        .createdAt(Instant.now())
        .updatedAt(Instant.now())
        .build();
    }
}
