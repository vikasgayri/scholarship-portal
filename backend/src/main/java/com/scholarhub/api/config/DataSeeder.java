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
                        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
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
                        "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
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
                        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
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
                        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
                        "https://www.minorityaffairs.gov.in/",
                        new BigDecimal("30000"),
                        400,
                        LocalDate.now().plusMonths(3),
                        true,
                        "Pan India"),
                buildScholarship("Central Sector Scholarship", "Department of Higher Education", "Annual scholarship for top-performing class 12 graduates entering college.", "Students above the 80th percentile in class 12 with regular college admission.", "Merit","https://scholarships.gov.in/", new BigDecimal("20000"), 820, LocalDate.now().plusMonths(5), true, "Pan India"),
                buildScholarship("AICTE Pragati Scholarship", "AICTE", "Encourages girl students to pursue technical diploma and degree education.", "Girl students admitted to first year technical diploma or degree courses.", "Women Education", "https://www.aicte-india.org/", new BigDecimal("50000"), 300, LocalDate.now().plusMonths(2), true, "Pan India"),
                buildScholarship("AICTE Saksham Scholarship", "AICTE", "Support for specially abled students pursuing technical education.", "Students with benchmark disability admitted to AICTE-approved institutions.", "Accessibility", "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80", "https://www.aicte-india.org/", new BigDecimal("50000"), 120, LocalDate.now().plusMonths(2), false, "Pan India"),
                buildScholarship("INSPIRE Scholarship", "Department of Science and Technology", "Scholarship for students pursuing basic and natural sciences.", "Top science students enrolled in BSc, BS, integrated MSc, or MS programs.", "Science", "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80", "https://online-inspire.gov.in/", new BigDecimal("80000"), 150, LocalDate.now().plusMonths(6), true, "Pan India"),
                buildScholarship("NSP Top Class Education Scholarship", "National Scholarship Portal", "Premium support for tuition and living costs in top institutions.", "Eligible students admitted to notified top-class institutions through regular selection.", "Need Based", "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e7e8?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("75000"), 220, LocalDate.now().plusMonths(4), false, "Pan India"),
                buildScholarship("Rajasthan Uttar Matric Scholarship", "Government of Rajasthan", "State scholarship for Rajasthan students pursuing post-matric education.", "Rajasthan domicile students meeting category and income requirements.", "Rajasthan", "https://images.unsplash.com/photo-1545128485-c400ce7b23d8?auto=format&fit=crop&w=900&q=80", "https://sso.rajasthan.gov.in/", new BigDecimal("28000"), 450, LocalDate.now().plusMonths(3), false, "Rajasthan"),
                buildScholarship("Minority Education Scholarship", "Minority Welfare Foundation", "Tuition assistance for minority students in school, college, and professional programs.", "Minority students with 50% or higher marks and valid income certificate.", "Minority", "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("25000"), 360, LocalDate.now().plusMonths(4), false, "Pan India"),
                buildScholarship("SC Higher Education Scholarship", "Social Justice Department", "Financial support for Scheduled Caste students in recognized higher education programs.", "SC students with domicile, caste certificate, and eligible annual family income.", "SC", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("32000"), 500, LocalDate.now().plusMonths(5), false, "Pan India"),
                buildScholarship("ST Higher Education Scholarship", "Tribal Affairs Department", "Scholarship for Scheduled Tribe students pursuing higher education.", "ST students enrolled in recognized institutions with valid category documents.", "ST", "https://images.unsplash.com/photo-1491308056676-205b7c9a7dc1?auto=format&fit=crop&w=900&q=80", "https://tribal.nic.in/", new BigDecimal("34000"), 420, LocalDate.now().plusMonths(4), false, "Pan India"),
                buildScholarship("OBC Post Matric Scholarship", "Backward Classes Welfare Board", "Need-based post-matric support for eligible OBC students.", "OBC students with income certificate and admission to a recognized course.", "OBC", "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("26000"), 520, LocalDate.now().plusMonths(3), false, "Pan India"),
                buildScholarship("EWS Education Assistance", "Education Access Trust", "Assistance for economically weaker section students pursuing graduation.", "EWS students with valid certificate and at least 55% marks in the previous exam.", "EWS", "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("30000"), 280, LocalDate.now().plusMonths(5), false, "Pan India"),
                buildScholarship("National Sports Scholarship", "Sports Development Authority", "Supports student athletes balancing competitive sports and formal education.", "State or national-level athletes enrolled in school, college, or university.", "Sports", "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80", "https://yas.nic.in/", new BigDecimal("60000"), 90, LocalDate.now().plusMonths(2), true, "Pan India"),
                buildScholarship("Undergraduate Research Fellowship", "Innovation Research Council", "Research grant for undergraduate students working with faculty mentors.", "Students with a research proposal, mentor endorsement, and strong academic record.", "Research", "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=900&q=80", "https://dst.gov.in/", new BigDecimal("100000"), 60, LocalDate.now().plusMonths(6), true, "Pan India"),
                buildScholarship("Women Education Scholarship", "Future Women Foundation", "Supports women continuing undergraduate or postgraduate education.", "Women students with financial need and confirmed admission to a recognized institution.", "Women Education", "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("45000"), 180, LocalDate.now().plusMonths(4), true, "Pan India"),
                buildScholarship("Engineering Excellence Scholarship", "Engineers India Education Trust", "Merit scholarship for students in engineering and technology programs.", "Engineering students with at least 70% marks and no active backlogs.", "Engineering", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80", "https://www.aicte-india.org/", new BigDecimal("75000"), 140, LocalDate.now().plusMonths(5), true, "Pan India"),
                buildScholarship("Medical Studies Scholarship", "Health Education Foundation", "Tuition support for MBBS, BDS, nursing, pharmacy, and allied health students.", "Medical and allied health students with merit rank and income eligibility.", "Medical", "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80", "https://www.nmc.org.in/", new BigDecimal("90000"), 110, LocalDate.now().plusMonths(3), true, "Pan India"),
                buildScholarship("Rural Rising Fund", "Community Growth Foundation", "Need-based financial support for students from rural communities.", "Applicants from rural communities with household income below the threshold.", "Need Based", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("35000"), 200, LocalDate.now().plusMonths(2), false, "Rural Districts"),
                buildScholarship("First Generation Learner Grant", "BrightPath Initiative", "Helps first-generation college students pay tuition, books, and exam fees.", "Students whose parents or guardians have not completed a college degree.", "Need Based", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80", "https://scholarships.gov.in/", new BigDecimal("40000"), 160, LocalDate.now().plusMonths(4), false, "Pan India"),
                buildScholarship("Digital India Technology Scholarship", "Digital Skills Council", "Support for students learning software, data, cybersecurity, and cloud computing.", "Students enrolled in recognized technology programs with project portfolio evidence.", "Technology", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", "https://www.digitalindia.gov.in/", new BigDecimal("65000"), 130, LocalDate.now().plusMonths(5), true, "Pan India"),
                buildScholarship("Teacher Training Scholarship", "Education Futures Trust", "Scholarship for B.Ed., D.El.Ed., and teacher education candidates.", "Teacher education students with admission confirmation and community service interest.", "Education", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80", "https://www.education.gov.in/", new BigDecimal("42000"), 95, LocalDate.now().plusMonths(3), false, "Pan India"),
                buildScholarship("Green Energy Fellowship", "Clean Future Foundation", "Fellowship for students researching renewable energy and sustainability.", "Students with a renewable energy, environment, or sustainability research proposal.", "Research", "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80", "https://mnre.gov.in/", new BigDecimal("120000"), 45, LocalDate.now().plusMonths(6), false, "Pan India")));
    }

    private Scholarship buildScholarship(
            String title,
            String provider,
            String description,
            String eligibility,
            String category,
            String imageUrl,
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
//                .imageUrl(imageUrl)
//                .officialWebsite(officialWebsite)
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
