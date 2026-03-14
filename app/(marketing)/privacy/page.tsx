export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 py-24">
      <h1 className="text-2xl font-semibold text-foreground">Privacy</h1>
      <p className="text-foreground leading-relaxed">
        Email addresses collected via the waitlist or feature voting are used
        only for Helm product updates and to associate votes with a single
        identity. We do not share them with third parties or use them for
        other purposes.
      </p>
    </div>
  );
}
