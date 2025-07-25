import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";

// Define a more specific type for colors if needed, or use string
interface EmailTemplateColors {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    border: string;
}

// Default color scheme (light mode)
const defaultColors: EmailTemplateColors = {
    background: "oklch(0.99 0 0)", // Light background
    foreground: "oklch(0.15 0.10 275.96)", // Dark text
    card: "oklch(1.00 0 0)", // White card
    cardForeground: "oklch(0.15 0.10 275.96)", // Dark text on card
    primary: "oklch(0.28 0.18 269.94)", // Primary color (purple-ish)
    primaryForeground: "oklch(0.99 0 0)", // Light text on primary
    border: "oklch(0.98 0.05 129.09)", // Light border
};

type EmailTemplateProps = {
    name?: string; // Made optional for generic emails
    recipient?: string; // Made optional
    subject: string;
    body: React.ReactNode; // Allow JSX for more complex email bodies
    footerText?: string;
    companyName?: string;
    logoUrl?: string; // URL for the company logo
    previewText?: string;
    colors?: Partial<EmailTemplateColors>; // Allow overriding default colors
};

export function EmailTemplate({
    name,
    subject,
    body,
    footerText = "Thank you for your attention.",
    companyName = "Your Company Name",
    logoUrl = "/UI_logo.png", // Default logo, ensure it's accessible via a public URL
    previewText,
    colors: customColors,
}: EmailTemplateProps) {
    const c = { ...defaultColors, ...customColors };

    return (
        <Html>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                background: c.background,
                                foreground: c.foreground,
                                card: c.card,
                                "card-foreground": c.cardForeground,
                                primary: c.primary,
                                "primary-foreground": c.primaryForeground,
                                border: c.border,
                            },
                        },
                    },
                }}
            >
                <Head />
                {previewText && <Preview>{previewText}</Preview>}
                <Body className="bg-background text-foreground font-sans">
                    <Container className="mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
                        <Section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                            {logoUrl && (
                                <Section className="bg-primary text-center p-5">
                                    <Img
                                        src={logoUrl}
                                        alt={`${companyName} Logo`}
                                        width="96" // Adjust as needed
                                        height="96" // Adjust as needed
                                        className="mx-auto"
                                    />
                                </Section>
                            )}

                            <Section className="p-6 md:p-8">
                                <Heading className="text-2xl font-bold text-primary mb-6">
                                    {subject}
                                </Heading>

                                {name && (
                                    <Text className="text-base mb-4">
                                        Dear {name},
                                    </Text>
                                )}

                                <div className="text-card-foreground text-base leading-relaxed">
                                    {body}
                                </div>

                                <Hr className="border-border my-8" />

                                <Text className="text-sm text-foreground/80">
                                    {footerText}
                                </Text>
                                <Text className="text-sm text-foreground/80 mt-1">
                                    Regards,
                                    <br />
                                    The {companyName} Team
                                </Text>
                            </Section>
                        </Section>

                        <Section className="text-center mt-8">
                            <Text className="text-xs text-foreground/60">
                                &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
                            </Text>
                            {/* Add unsubscribe link or company address if needed */}
                            {/* <Link href="https://example.com/unsubscribe" className="text-xs text-primary hover:underline">
                                Unsubscribe
                            </Link> */}
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}