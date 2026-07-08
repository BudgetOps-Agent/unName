import Link from "next/link";
import { Card } from "@/shared/components/card/Card";
import NewteamForm from "./components/CreateTeamForm/CreateTeamForm";

const NewTeam = () => {
    return (
        <>
            <Link href="/" className="link-back"><span>내 모임으로 돌아가기</span></Link>
            <Card>
                <NewteamForm />
            </Card>
        </>
    )
}

export default NewTeam