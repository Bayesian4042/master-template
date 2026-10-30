import { PageContainer } from "@repo/ui/general/PageContainer";
import {
	ProfileHeader,
	SessionsList,
	UserInfoForm,
} from "@/components/profile";

const SettingsPage = () => {
	return (
		<PageContainer className="space-y-6">
			<ProfileHeader />
			<UserInfoForm />
			<SessionsList />
		</PageContainer>
	);
};

export default SettingsPage;
