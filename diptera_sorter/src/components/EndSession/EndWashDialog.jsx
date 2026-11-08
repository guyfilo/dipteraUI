import React, {useState} from "react";

export default function EndWashDialog({machineId, machine, onAnswer}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const prompt = machine.end_wash_prompt;
    const bottle = {clean_water: "clean-water bottle", larvae_water: "larvae-water bottle"}[prompt.bottle] || prompt.bottle;
    const ready = machine.water_bottle_state === "Full" && machine.larvae_bottle_state === "Full";
    const answer = async action => {
        setBusy(true);
        setError("");
        try {
            await onAnswer(machineId, prompt.id, action);
        } catch (err) {
            setError("Could not send the command. Please retry.");
        } finally {
            setBusy(false);
        }
    };
    return <section role="dialog" aria-modal="true" aria-label={machineId + " wash interrupted"}
                    className="master-stop-dialog">
        <h2>{machineId}: wash aborted</h2>
        <p>The wash was aborted because the {bottle} became empty. The machine is asleep.</p>
        <p>Make sure there is enough water in both input bottles, then press Continue to restart the full wash.</p>
        {!ready && <p>Waiting for both input bottles to report Full.</p>}
        {error && <p role="alert">{error}</p>}
        <div className="master-stop-actions">
            <button type="button" disabled={busy} onClick={() => answer("cancel")}>Cancel</button>
            <button type="button" disabled={busy || !ready} onClick={() => answer("continue")}>Continue</button>
        </div>
    </section>;
}
