// Copied as-is from pan-verify src/pages/application-configuration/index.tsx
// Only changes: .tsx → .jsx, extension_active → is_active (our model field)
import React, { useEffect, useState } from "react";
import "./application-configuration.css";
import { BreadCrumb, setBreadCrumpsItems } from "nitrozen-react-extension";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input, SvgIcCopy, ToggleButton } from "@gofynd/nitrozen-react";
import { toast } from "react-toastify";
import { getApplicationById, toggleExtensionActive } from "../../services/configurationPage.service";

const ApplicationConfiguration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { company_id, application_id } = useParams();

  const inputIds = {
    companyId: "company-id",
    appId: "app-id",
  };

  const handleClick = (link) => {
    navigate(link);
  };

  const [isChannelActive, setIsChannelActive] = useState(false);

  const handleCopy = (value) => {
    let inputValue = "";
    switch (value) {
      case "companyId":
        inputValue = company_id;
        break;
      case "appId":
        inputValue = application_id;
        break;
      default:
        break;
    }

    navigator.clipboard
      .writeText(inputValue)
      .then(() => {
        toast.success(`Copied to clipboard`);
      })
      .catch((err) => {
        console.error("Failed to copy", err);
      });
  };

  setBreadCrumpsItems("Configuration", location.pathname + location.search);

  useEffect(() => {
    getApplicationByIdDetails();
  }, []);

  const getApplicationByIdDetails = () => {
    if (application_id) {
      getApplicationById(application_id)
        .then((response) => {
          setIsChannelActive(response?.data?.is_active || false);
        })
        .catch((error) => {
          console.log("error from getApplicationById", error);
        });
    }
  };

  const handleToggleChannel = async () => {
    try {
      if (!application_id) {
        return;
      }
      const isActive = !isChannelActive;
      setIsChannelActive(isActive);
      await toggleExtensionActive(application_id, isActive, company_id);
      toast.success(`Extension ${isActive ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      console.log("error from handleToggleChannel", error);
    }
  };

  return (
    <>
      <div className={"config-component"}>
        <BreadCrumb handleClick={handleClick} />
        <div className={"config-page"}>
          <div className={"page-title-container"}>
            <div className={"page-title-text"}>Application Configuration</div>
            <ToggleButton value={isChannelActive ?? false} onToggle={handleToggleChannel} size="medium" />
          </div>
          {isChannelActive && (
            <div className="client-credentials-box">
              <div className="title">Client Credentials</div>
              <div className="description">
                Use these client credentials to access the Extension APIs from your website. Add the
                credentials into your api request code.
              </div>
              <div className="flex-items">
                <Input
                  label="Company Id"
                  id={inputIds.companyId}
                  type="text"
                  value={company_id}
                  disabled={true}
                />
                <div className="side-btn">
                  <div title="Copy Company Id" className="copy-btn" onClick={() => handleCopy("companyId")}>
                    <SvgIcCopy width={22} height={22} />
                  </div>
                </div>
              </div>
              <div className="flex-items">
                <Input
                  label="Application Id"
                  id={inputIds.appId}
                  type="text"
                  value={application_id}
                  disabled={true}
                />
                <div className="side-btn">
                  <div title="Copy Application Id" className="copy-btn" onClick={() => handleCopy("appId")}>
                    <SvgIcCopy width={22} height={22} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApplicationConfiguration;
